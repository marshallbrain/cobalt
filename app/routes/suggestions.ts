import type { LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";


export async function loader({
    request,
}: LoaderFunctionArgs) {
    const params = new URL(request.url).searchParams
    const from = params.get("from")
    const field = params.get("field")

    if (!from) throw 400
    if (!field) return json(Object.keys(fields)
        .filter(value => value.startsWith(from.substring(1)))
        .map(value => ({label: value})))

    const suggestions = await fields[field as keyof typeof fields](from)
    return json(suggestions)
}

const fields = {
    "author": (from: string) => db.selectFrom("author")
        .select("author_name as label")
        .where("author_name", "ilike", from.concat("%")).execute(),
    "domain": (from: string) => []
}
