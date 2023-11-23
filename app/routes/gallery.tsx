import React from 'react';
import SearchBar from "~/components/SearchBar";
import {useSearchParams, useSubmit} from "@remix-run/react";
import type { LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import type {SelectQueryBuilder} from "kysely";
import type {DB} from "~/db/types";

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

    console.log(query.compile())

    return json({})
}

function querySearch(query: Query, search: string) {
    const terms = [...search.matchAll(regex)].map(term => term[1] || term[2])
    terms.forEach(term => {
        query = query.where("photo_name", "like", "%".concat(term, "%"))
    })
    return query
}

function queryOrder(query: Query, order: string, dir: boolean) {
    switch (order) {
        default:
            return query.orderBy("photo_name", (dir)? "asc": "desc")
    }
}

export default function Gallery() {
    const [search] = useSearchParams()
    const setSearch = useSubmit()

    return (
        <>
            <SearchBar search={Object.fromEntries(search.entries())} onSearch={setSearch}/>
        </>
    )
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
