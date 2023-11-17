import * as fs from "fs/promises";
import path from "path";

export async function getMetadataFile(photoFile: string, photoPath: string) {
    const dataFile = photoFile.concat(".json")
    const fallback = photoFile.replace(path.extname(photoFile), "")

    return await fs.readFile(path.join(photoPath, dataFile), {encoding: 'utf8'})
            .then((metadata) => ({metadata, file: dataFile}))
            .catch(() => null) ??
        fs.readFile(path.join(photoPath, fallback), {encoding: 'utf8'})
            .then((metadata) => ({metadata, file: fallback}))
            .catch(() => null)
}

export function validateMetadataJson(json: JsonData, titleFallback: string): Metadata {
    return {
        photo_name: json.title ?? titleFallback,
        photo_author: json.artist ?? "",
        photo_rating: json.rating ?? "Explicit",
        photo_domain: json.domain ?? "Raw",
        photo_source: json.source ?? "",
        created_at: json.createDate ?? ""
    }
}

interface JsonData {
    title?: string
    artist?: string
    rating?: string
    domain?: string
    source?: string
    createDate?: string
}

interface Metadata {
    photo_name: string
    photo_author: string
    photo_rating: string
    photo_domain: string
    photo_source: string
    created_at: string
}
