import mime from "mime-types";
import {db} from "~/db/database.server";
import * as fs from "fs/promises";
import path from "path";
import {getMetadataFile, validateMetadataJson} from "~/routes/sync.import.files/metadata";

export default async function importPhoto(fileName: string, filePath: string, full: boolean = false) {
    const dupe = await db.selectFrom("files")
        .select("file_id")
        .where("file_name", "=", fileName)
        .limit(1)
        .execute()
    if (dupe.length > 0) {
        return
    }

    const photoStats = await fs.stat(path.join(filePath, fileName))
    const fileProps: FileProps = {
        created_at: photoStats.mtime,
        modified_at: photoStats.birthtime
    }

    const dataFile = await getMetadataFile(fileName, filePath)
    const json = (dataFile)? JSON.parse(dataFile.metadata): {}
    const metadata = validateMetadataJson(json, fileName.replace(path.extname(fileName), ""))

    const photoId = await db.insertInto("photos")
        .values({
            ...metadata,
            photo_width: 1,
            photo_height: 1,
            photo_type: path.extname(filePath).replace(".", ""),
        })
        .returning("photo_id")
        .executeTakeFirst().then((result) => result?.photo_id)

    if (photoId) {
        await db.insertInto("files")
            .values({
                ...fileProps,
                file_name: fileName,
                file_path: filePath,
                file_hash: "",
                file_primary: true,
                photo_id: photoId
            })
            .execute()
    }

    if (photoId && dataFile) {
        const dataStats = await fs.stat(path.join(filePath, dataFile.file))
        const dataProps: FileProps = {
            created_at: dataStats.mtime,
            modified_at: dataStats.birthtime
        }
        await db.insertInto("files")
            .values({
                ...dataProps,
                file_name: dataFile.file,
                file_path: filePath,
                file_hash: "",
                file_primary: false,
                photo_id: photoId
            })
            .execute()
    }

    // TODO implement rescan
    // TODO create thumbnails
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
