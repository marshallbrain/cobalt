import mime from "mime-types";
import {db} from "~/db/database.server";
import * as fs from "fs/promises";
import path from "path";
import type {JsonData, Metadata} from "~/routes/sync.import.files/metadata";
import {getMetadataStats, validateMetadataJson} from "~/routes/sync.import.files/metadata";
import sharp from "sharp"

export default async function importPhoto(fileName: string, filePath: string, full: boolean) {
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

    let data: DataProps | undefined
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

    const photoStats = await fs.stat(path.join(filePath, fileName))
    const photoData = await sharp(path.join(filePath, fileName)).metadata()

    // generateThumbnails(path.join(fileName, filePath))

    const photo: PhotoProps = {
        name: fileName,
        width: photoData.width ?? 0,
        height: photoData.height ?? 0,
        props: {
            created_at: photoStats.birthtime,
            modified_at: photoStats.mtime
        }
    }

    await createPhotoEntry(
        metadata,
        filePath,
        photo,
        data
    )
}

async function getAuthorId(author: string) {
    let authorId = await db.selectFrom("author")
        .select("author_id")
        .where("author_name", "=", author)
        .executeTakeFirst()

    if (!authorId) authorId = await db.insertInto("author")
        .values({author_name: author})
        .returning("author_id")
        .executeTakeFirst()

    return authorId?.author_id
}

async function getDomainId(domain: string) {
    let domainId = await db.selectFrom("domain")
        .select("domain_id")
        .where("domain_name", "=", domain)
        .executeTakeFirst()

    if (!domainId) domainId = await db.insertInto("domain")
        .values({domain_name: domain})
        .returning("domain_id")
        .executeTakeFirst()

    return domainId?.domain_id
}

async function createPhotoEntry(
    metadata: Metadata,
    file: string,
    photo: PhotoProps,
    data: DataProps | undefined
) {
    const {photo_author, photo_domain, ...values} = metadata

    const authorId = await getAuthorId(photo_author)
    const domainId = await getDomainId(photo_domain)

    if (!authorId || !domainId) return

    const photoId = await db.insertInto("photos")
        .values({
            ...values,
            photo_width: photo.width,
            photo_height: photo.height,
            photo_type: photo.name,
            author_id: authorId,
            domain_id: domainId
        })
        .returning("photo_id")
        .executeTakeFirst()
        .then((value) => value?.photo_id)

    if (!photoId) return

    await db.insertInto("files")
        .values({
            ...photo.props,
            file_name: photo.name,
            file_path: file,
            file_hash: "",
            file_primary: true,
            photo_id: photoId,
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
            photo_id: photoId,
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
    const {photo_author, photo_domain, ...values} = metadata

    const authorId = await getAuthorId(metadata.photo_author)
    const domainId = await getDomainId(metadata.photo_domain)

    if (!authorId || !domainId) return

    await db.updateTable("photos")
        .set({
            ...values,
            modified_at: new Date().toISOString(),
            author_id: authorId,
            domain_id: domainId
        })
        .where("photo_id", "=", dupeId)
        .execute()

    if (!data) return

    await db.updateTable("files")
        .set({
            ...data.props,
            file_name: data.name,
            file_path: file,
            file_hash: "",
            photo_id: dupeId,
        })
        .where("photo_id", "=", dupeId)
        .where("file_primary", "=", false)
        .execute()
}

/*async function generateThumbnails(file: string) {
    sharp(file)
}*/

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

interface PhotoProps {
    name: string
    width: number
    height: number
    props: {
        created_at: Date
        modified_at: Date
    }
}

interface DataProps {
    name: string
    props: {
        created_at: Date
        modified_at: Date
    }
}
