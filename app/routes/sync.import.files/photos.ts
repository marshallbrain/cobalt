import mime from "mime-types";
import {db} from "~/db/database.server";
import * as fs from "fs/promises";
import path from "path";
import type { Metadata} from "~/routes/sync.import.files/metadata";
import {getMetadataFile, validateMetadataJson} from "~/routes/sync.import.files/metadata";

export default async function importPhoto(fileName: string, filePath: string, full: boolean = true) {
    const dupeId = await db.selectFrom("photos")
        .innerJoin("files", "files.photo_id", "photos.photo_id")
        .select("photos.photo_id")
        .where("files.file_name", "=", fileName)
        .execute()
    if (!full && dupeId.length > 0) {
        return
    }

    const dataFile = await getMetadataFile(fileName, filePath)
    const json = (dataFile)? JSON.parse(dataFile.metadata): {}
    const metadata = validateMetadataJson(json, fileName.replace(path.extname(fileName), ""))

    if (dupeId.length > 0) {
        await updatePhotoEntry(dupeId[0].photo_id, metadata, filePath, fileName, dataFile?.file)
        return
    }

    await createPhotoEntry(metadata, filePath, fileName, dataFile?.file)

    // TODO implement rescan
    // TODO create thumbnails
}

async function createPhotoEntry(
    metadata: Metadata,
    file: string,
    photo: string,
    data: string | undefined
) {
    const photoId = await db.insertInto("photos")
        .values({
            ...metadata,
            photo_width: 1,
            photo_height: 1,
            photo_type: path.extname(photo).replace(".", ""),
        })
        .returning("photo_id")
        .executeTakeFirst().then((result) => result?.photo_id)

    if (!photoId) return

    const photoStats = await fs.stat(path.join(file, photo))
    const photoProps: FileProps = {
        created_at: photoStats.birthtime,
        modified_at: photoStats.mtime
    }

    await db.insertInto("files")
        .values({
            ...photoProps,
            file_name: photo,
            file_path: file,
            file_hash: "",
            file_primary: true,
            photo_id: photoId
        })
        .execute()

    if (!data) return

    const dataStats = await fs.stat(path.join(file, data))
    const dataProps: FileProps = {
        created_at: dataStats.birthtime,
        modified_at: dataStats.mtime
    }

    await db.insertInto("files")
        .values({
            ...dataProps,
            file_name: data,
            file_path: file,
            file_hash: "",
            file_primary: false,
            photo_id: photoId
        })
        .execute()
}

async function updatePhotoEntry(
    dupeId: number,
    metadata: Metadata,
    file: string,
    photo: string,
    data: string | undefined
) {
    await db.updateTable("photos")
        .set({
            ...metadata,
            photo_width: 1,
            photo_height: 1,
            photo_type: path.extname(photo).replace(".", ""),
        })
        .where("photo_id", "=", dupeId)
        .execute()

    if (!data) return

    const dataStats = await fs.stat(path.join(file, data))
    const dataProps: FileProps = {
        created_at: dataStats.birthtime,
        modified_at: dataStats.mtime
    }

    await db.updateTable("files")
        .set({
            ...dataProps,
            file_name: data,
        })
        .where("photo_id", "=", dupeId)
        .where("file_primary", "=", false)
        .execute()
}

export function isPhoto(file: string) {
    return supportedTypes.includes(mime.lookup(file) || "")
}

const supportedTypes = [
    mime.types["jpeg"],
    mime.types["png"]
]


interface FileProps {
    created_at: Date
    modified_at: Date
}
