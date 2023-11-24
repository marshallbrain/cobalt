import * as fs from "fs/promises";
import path from "path";
import {db} from "~/db/database.server";

export async function getMetadataStats(photoFile: string, photoPath: string) {
    const dataFile = photoFile.concat(".json")
    const fallback = photoFile.replace(path.extname(photoFile), ".json")

    const dataPath = path.join(photoPath, dataFile)
    const fallPath = path.join(photoPath, fallback)

    const data = await fs.stat(dataPath)
        .then((stats) => ({dataStats: stats, dataFile: dataFile}))
        .catch(() => null)

    return data ?? fs.stat(fallPath)
        .then((stats) => ({dataStats: stats, dataFile: fallback}))
        .catch(() => ({dataStats: undefined, dataFile: undefined}))
}

export function validateMetadataJson(json: JsonData, titleFallback: string, ratingFav: number): Metadata {

    let rating = parseInt(json.rating ?? "")
    if (isNaN(rating)) rating = ratingFav
    if (rating < 0) rating = 0

    return {
        photo_name: json.title ?? titleFallback,
        photo_author: json.artist ?? "",
        photo_rating: rating,
        photo_domain: json.domain ?? "Raw",
        photo_source: json.source ?? "",
        created_at: json.createDate ?? ""
    }
}

export interface JsonData {
    title?: string
    artist?: string
    rating?: string
    domain?: string
    source?: string
    createDate?: string
}

export interface Metadata {
    photo_name: string
    photo_author: string
    photo_rating: number
    photo_domain: string
    photo_source: string
    created_at: string
}
