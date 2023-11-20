import React, {useEffect, useState} from 'react';
import type {MetaFunction} from "@remix-run/node";
import type {SearchQuery} from "~/components/SearchBar";
import SearchBar from "~/components/SearchBar";

export const meta: MetaFunction = () => {
    return [
        { title: "Gallery" },
    ]
}

export default function Gallery() {
    const [search, setSearch] = useState<SearchQuery>({
        query: "",
        sort: "name",
        order: false,
        rating: "general"
    })

    return (
        <>
            <SearchBar search={search} updateSearch={setSearch}/>
        </>
    )
}
