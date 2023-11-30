import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {searchPhotos} from "~/db/searchPhotos.server";

export const meta: MetaFunction = () => {return [{ title: "Search" }]}

export async function loader({
    request,
}: LoaderFunctionArgs) {
    const params = new URL(request.url).searchParams

    return json(await searchPhotos({
        query: params.get("query") ?? "",
        rating: parseInt(params.get("rating") ?? "0"),
        sort: params.get("sort") ?? "name",
        order: params.has("order", "true") ?? false,
        offset: parseInt(params.get("offset") ?? ""),
        limit: parseInt(params.get("limit") ?? ""),
    }).execute())
}
