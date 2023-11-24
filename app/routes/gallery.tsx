import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import SearchBar from "~/components/SearchBar";
import {useFetcher, useSearchParams, useSubmit} from "@remix-run/react";
import { VirtuosoGrid } from 'react-virtuoso';
import {Box, Chip, Unstable_Grid2 as Grid, Paper, Skeleton, Stack, Typography, styled} from "@mui/material";
import {loader} from "~/routes/search";

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
    const [photos, setPhotos] = useState<Exclude<typeof fetcher.data, undefined>>([])
    const [hydrate, setHydrate] = useState(false)
    const fetcher = useFetcher<typeof loader>()
    const setSearch = useSubmit()

    const loadMore = useCallback(() => {
        if (fetcher.state == "idle") fetcher.load("/search?" + new URLSearchParams(search))
    }, [fetcher, search])

    useEffect(() => {
        if (fetcher.state === "loading") return
        if (fetcher.data) setPhotos((prevState: typeof photos) => [...prevState, ...fetcher.data ?? []])
    }, [fetcher.data, fetcher.state])

    useEffect(() => {
        setHydrate(false)
        setPhotos([])
    }, [search])

    useEffect(() => {
        if (!hydrate) {
            setHydrate(true)
            loadMore()
        }
    }, [hydrate, loadMore])

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
                data={photos}
                endReached={loadMore}
                overscan={24}
                components={{
                    Item: ItemWrapper,
                    List: GalleryWrapper as any,
                }}
                itemContent={(index, photo) => (
                    <Paper sx={{margin: 0.5}}>
                        <Skeleton variant="rectangular" width={"100%"} height={"auto"} sx={{
                            aspectRatio: 1,
                            borderTopLeftRadius: "inherit",
                            borderTopRightRadius: "inherit",
                        }}/>
                        <Grid container sx={{p: 0.5, pr: 0, "& > *": {pr: 0.5}}}>
                            <Grid xs={12} >
                                <Typography
                                    variant="body1"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                >
                                    {photo.photo_name}
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Chip label={photo.author_name} size="small" sx={{width: "100%"}} />
                            </Grid>
                            <Grid xs={6}>
                                <Chip label={photo.domain_name} size="small" sx={{width: "100%"}} />
                            </Grid>
                        </Grid>
                    </Paper>
                )}
            />
        </Stack>
    )
}
