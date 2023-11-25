import React from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import type {SelectQueryBuilder} from "kysely";
import type {DB} from "~/db/types";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import {sql} from "kysely";

export const meta: MetaFunction = () => {return [{ title: "Search" }]}

const regex = /"(.+)"|(\w+)/g

export async function loader({
    request,
}: LoaderFunctionArgs) {
    const params = new URL(request.url).searchParams

    let query: Query = db.selectFrom("photos")
        .innerJoin("author", "author.author_id", "photos.author_id")
        .innerJoin("domain", "domain.domain_id", "photos.domain_id")
        .select(["photo_id", "photo_name", "author_name", "domain_name"])

    query = querySearch(query, params.get("query") ?? "")
    query = query.where("photo_rating", "<=", parseInt(params.get("rating") ?? "0"))
    query = queryOrder(query, params.get("sort") ?? "name", params.has("order", "true"))

    const offset = parseInt(params.get("offset") || "")
    const limit = parseInt(params.get("limit") || "")

    if (isNaN(offset) || isNaN(limit)) throw 500

    query = query.offset(offset).limit(limit)
    const photoEntries = await query.execute()

    return json(photoEntries)
}

function querySearch(query: Query, search: string) {
    const terms = [...search.matchAll(regex)].map(term => term[1] || term[2])
    terms.forEach(term => {
        query = query.where("photo_name", "like", "%".concat(term, "%"))
    })
    return query
}

function queryOrder(query: Query, order: string, dir: boolean) {
    const direction = (dir)? "desc": "asc"
    const naturalDir = (dir)? sql`COLLATE "custom_numeric" desc`: sql`COLLATE "custom_numeric" asc`

    switch (order) {
        default:
            return query.orderBy("photo_name", naturalDir)
    }
}

type Query =  SelectQueryBuilder<
    DB,
    "photos" | "author" | "domain",
    {
        photo_id: number,
        photo_name: string,
        author_name: string,
        domain_name: string
    }
>
