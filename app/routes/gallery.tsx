import React, {useCallback, useEffect, useState} from 'react';
import SearchBar from "~/components/SearchBar";
import {Link, useFetcher, useSearchParams, useSubmit} from "@remix-run/react";
import { VirtuosoGrid } from 'react-virtuoso';
import {Chip, Unstable_Grid2 as Grid, Paper, Stack, Typography, styled} from "@mui/material";
import type {loader} from "~/routes/search";

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

const Img = styled("img")(({theme}) => ({
    aspectRatio: 1,
    borderTopLeftRadius: "inherit",
    borderTopRightRadius: "inherit",
    width: "100%",
    height: "auto",
    marginBottom: theme.spacing(-1)
}))

export default function Gallery() {
    const [search] = useSearchParams()
    const [photos, setPhotos] = useState<Exclude<typeof fetcher.data, undefined>>([])
    const [hydrate, setHydrate] = useState(false)
    const fetcher = useFetcher<typeof loader>()
    const setSearch = useSubmit()

    const loadMore = useCallback((offset: number) => {
        if (fetcher.state == "idle") fetcher.load("/search?".concat(new URLSearchParams({
            ...Object.fromEntries(search.entries()),
            "offset": offset.toString(),
            "limit": "24"
        }).toString()))
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
            loadMore(0)
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
                        <Link to={"/view/index/" + index + "?" + search}>
                            <Img
                                alt={photo.photo_name}
                                src={"/photo/".concat(
                                    photo.photo_id.toString(),
                                    ".jpg?",
                                    new URLSearchParams({
                                        w: "500",
                                    }).toString()
                                )}
                                loading="lazy"
                            />
                        </Link>
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
