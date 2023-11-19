import React from 'react';
import type {MetaFunction} from "@remix-run/node";
import SearchBar from "~/components/SearchBar";

export const meta: MetaFunction = () => {
    return [
        { title: "Gallery" },
    ]
}

export default function Gallery() {
    return (
        <>
            <SearchBar/>
        </>
    )
}
