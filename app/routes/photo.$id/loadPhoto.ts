import sharp from "sharp";
import path from "path";

export default async function (
    file: {file_name: string, file_path: string},
    type: "jpg" | "jpeg" | "png" | "gif",
    width: number,
    height: number,
) {
    return sharp(path.join(file.file_path, file.file_name))
        .resize(width, height, {fit: "cover"})
        .toFormat("jpg")
        .toBuffer()
}
