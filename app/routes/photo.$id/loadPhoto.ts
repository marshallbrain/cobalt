import sharp from "sharp";
import path from "path";

export default async function (file: {file_name: string, file_path: string}) {
    return sharp(path.join(file.file_path, file.file_name))
        .resize(720, 720, {fit: "cover"})
        .toFormat('jpg')
        .toBuffer()
}
