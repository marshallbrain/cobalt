import themes from "~/utils/themes";

export function validateSettings(data: { [p: string]: File | string }) {
    const settings: Settings = {id: 1}

    if ("theme" in data && data.theme as string in themes) settings.theme = data.theme as string
    if ("ratings" in data) settings.ratings = (data.ratings as string).split(",")
    if ("ratingFav" in data) settings.ratingFav = parseInt(data.ratingFav as string)

    return settings
}

interface Settings {
    id: number
    theme?: string
    ratings?: string[],
    ratingFav?: number
}
