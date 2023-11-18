import themes from "~/utils/themes";

export function validateSettings(data: { [p: string]: File | string }) {
    let settings: Settings = {id: 1}

    if ("theme" in data && data.theme as string in themes) settings = {...settings, theme: data.theme as string}

    return settings
}

interface Settings {
    id: number
    theme?: string
}
