import mime from "mime-types";
import {db} from "~/db/database.server";
import * as fs from "fs/promises";
import path from "path";
import type {JsonData, Metadata} from "~/routes/sync.import.files/metadata";
import {getMetadataStats, validateMetadataJson} from "~/routes/sync.import.files/metadata";

export default async function importPhoto(fileName: string, filePath: string, full: boolean = true) {
    let metadataLastUpdate: {modified_at: Date}[] | undefined

    const dupeId = await db.selectFrom("photos")
        .innerJoin("files", "files.photo_id", "photos.photo_id")
        .select(["photos.photo_id"])
        .where("files.file_name", "=", fileName)
        .execute()
    if (dupeId.length > 0) {
        if (!full) return

        metadataLastUpdate = await db.selectFrom("files")
            .select("modified_at")
            .where("photo_id", "=", dupeId[0].photo_id)
            .where("file_primary", "=", false)
            .execute()
    }

    const {dataFile, dataStats} = await getMetadataStats(fileName, filePath)
    if (metadataLastUpdate && dataStats && dataStats.mtime <= metadataLastUpdate[0].modified_at) return

    let data: {name: string, props: FileProps} | undefined
    let json: JsonData = {}
    if (dataFile) {
        json = JSON.parse(await fs.readFile(path.join(filePath, dataFile), {encoding: 'utf8'}))

        data = {
            name: dataFile,
            props: {
                created_at: dataStats.birthtime,
                modified_at: dataStats.mtime
            }
        }
    }

    const metadata = validateMetadataJson(json, fileName.replace(path.extname(fileName), ""))

    if (dupeId.length > 0) {
        await updatePhotoEntry(
            dupeId[0].photo_id,
            metadata,
            filePath,
            {name: fileName},
            data
        )
        return
    }

    await createPhotoEntry(
        metadata,
        filePath,
        {name: fileName},
        data
    )

    // TODO implement rescan
    // TODO create thumbnails
}

async function createPhotoEntry(
    metadata: Metadata,
    file: string,
    photo: { name: string },
    data: { name: string, props: FileProps} | undefined
) {
    const photoId = await db.insertInto("photos")
        .values({
            ...metadata,
            photo_width: 1,
            photo_height: 1,
            photo_type: path.extname(photo.name).replace(".", ""),
        })
        .returning("photo_id")
        .executeTakeFirst().then((result) => result?.photo_id)

    if (!photoId) return

    const photoStats = await fs.stat(path.join(file, photo.name))
    const photoProps: FileProps = {
        created_at: photoStats.birthtime,
        modified_at: photoStats.mtime
    }

    await db.insertInto("files")
        .values({
            ...photoProps,
            file_name: photo.name,
            file_path: file,
            file_hash: "",
            file_primary: true,
            photo_id: photoId
        })
        .execute()

    if (!data) return

    await db.insertInto("files")
        .values({
            ...data.props,
            file_name: data.name,
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
    photo: { name: string },
    data: { name: string, props: FileProps} | undefined
) {
    await db.updateTable("photos")
        .set({
            ...metadata,
            photo_width: 1,
            photo_height: 1,
            modified_at: new Date().toISOString()
        })
        .where("photo_id", "=", dupeId)
        .execute()

    if (!data) return

    await db.updateTable("files")
        .set({
            ...data.props,
            file_name: data.name,
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
