import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import {db} from "~/db/database.server";
import loadImage from "~/routes/photo.$id/loadPhoto";

export const meta: MetaFunction = () => {return [{ title: "$id" }]}

export async function loader({
    request, params,
}: LoaderFunctionArgs) {

    const id = parseInt(params.id ?? "")
    if (isNaN(id)) throw 404

    const file = await db.selectFrom("files")
        .select(["file_name", "file_path"])
        .where("photo_id", "=", id)
        .where("file_primary", "=", true)
        .executeTakeFirst()

    if (!file) throw 404

    const photo = await loadImage(file)

    return new Response(photo, {status: 200, headers: {"Content-Type": "jpeg"}})
}
