import type { LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";


export async function loader({
    request,
}: LoaderFunctionArgs) {
    const params = new URL(request.url).searchParams
    const field = params.get("field")
    const from = params.get("from")

    if (!from) return json([])
    if (!field) return json([])
    if (field.length > 0 && !(field in fields)) return json([])

    if (field.length == 0) return json([])

    const suggestions = await fields[field as keyof typeof fields](from).execute()
    return json(suggestions)
}

const fields = {
    "author": (from: string) => db.selectFrom("author")
        .select("author_name as value")
        .where("author_name", "ilike", from.concat("%"))
}
