import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import {db} from "~/db/database.server";
import loadImage from "~/routes/photo.$id/loadPhoto";
import {json} from "@remix-run/node";

export const meta: MetaFunction = () => {return [{ title: "$id" }]}

export async function loader({
    request, params,
}: LoaderFunctionArgs) {
    const image = params.id ?? ""
    const searchParams = new URL(request.url).searchParams
    const width = parseInt(searchParams.get("w") ?? "")
    const height = parseInt(searchParams.get("h") ?? "")

    const id = parseInt(image.split(".")[0])
    const type = image.split(".")[1]

    if (isNaN(id)) throw json("Image Not Found", { status: 404 })
    if (isNaN(width)) throw json(
        "Image must have a width",
        { status: 400 }
    )
    if (!(["jpg", "jpeg", "png", "gif"].includes(type))) throw json(
        "Image does not have valid type",
        { status: 401 }
    )

    const file = await db.selectFrom("files")
        .select(["file_name", "file_path"])
        .where("photo_id", "=", id)
        .where("file_primary", "=", true)
        .executeTakeFirst()

    if (!file) throw 404

    const photo = await loadImage(file, type as any, width, (isNaN(height))? width: height)

    return new Response(photo, {status: 200, headers: {"Content-Type": "jpeg"}})
}
