import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import SearchBar from "~/components/SearchBar";
import {useSearchParams, useSubmit} from "@remix-run/react";
import type { LoaderFunctionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import type {SelectQueryBuilder} from "kysely";
import type {DB} from "~/db/types";
import { VirtuosoGrid } from 'react-virtuoso';
import {Box, Paper, Skeleton, Stack, styled} from "@mui/material";

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

    // console.log(query.compile())

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

const ItemWrapper = styled("div")(theme => ({
    flexBasis: 100/6 + "%",
    maxWidth: 100/6 + "%",
    display: "flex",
    flexDirection: "column",
}))

const GalleryWrapper = styled("div")(({theme}) => ({
    display: "flex",
    flexWrap: "wrap"
}))

export default function Gallery() {
    const [search] = useSearchParams()
    const setSearch = useSubmit()
    const [users, setUsers] = useState<number[]>(() => [1, 2, 3, 4, 5, 6])

    const loadMore = useCallback(() => setUsers(users => [...users, ...Array(16).keys()]), [setUsers])

    useEffect(() => {
        loadMore()
    }, [loadMore])

    return (
        <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="stretch"
            spacing={0}
            sx={{height: "100%"}}
        >
            <SearchBar search={Object.fromEntries(search.entries())} onSearch={setSearch}/>
            <VirtuosoGrid
                data={users}
                endReached={loadMore}
                overscan={8}
                components={{
                    Item: ItemWrapper,
                    List: GalleryWrapper as any,
                }}
                itemContent={(index) => (<Paper sx={{margin: 0.5}}>
                    <Skeleton variant="rectangular" width={"100%"} height={"auto"} sx={{
                        aspectRatio: 1,
                        borderTopLeftRadius: "inherit",
                        borderTopRightRadius: "inherit",
                    }}/>
                    <Box sx={{padding: 0.5}}>
                        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
                    </Box>
                </Paper>)}
            />
        </Stack>
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
