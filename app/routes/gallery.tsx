import React from 'react';
import SearchBar from "~/components/SearchBar";
import {useSearchParams, useSubmit} from "@remix-run/react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {db} from "~/db/database.server";
import {SelectQueryBuilder} from "kysely";
import {DB} from "~/db/types";

type Query =  SelectQueryBuilder<DB, "photos" | "author" | "domain", {photo_id: number, photo_name: string, author_name: string, domain_name: string}>

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

    query = queryOrder(query, params.get("sort") ?? "name", (params.get("order") === "true")? "asc": "desc")

    // console.log(query.compile())

    return json({})
}

function querySearch(query: Query, search: string) {
    return query.where("photo_name", "like", search)
}

function queryOrder(query: Query, order: string, dir: "asc" | "desc") {
    switch (order) {
        default:
            return query.orderBy("photo_name", dir)
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
