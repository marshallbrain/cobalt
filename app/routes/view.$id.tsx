import React, {useState} from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {AppBar, Box, Chip, styled, Theme, ToggleButton, ToggleButtonGroup, Toolbar, Typography} from '@mui/material';
import {db} from "~/db/database.server";
import {useLoaderData} from "@remix-run/react";
import AspectRatioRounded from "~/components/icons/AspectRatioRounded";
import FitScreenRounded from "~/components/icons/FitScreenRounded";
import PhotoSizeLargeRounded from '~/components/icons/PhotoSizeLargeRounded';

export const meta: MetaFunction = () => {return [{ title: "ViewId" }]}

const Img = styled("img", {
    shouldForwardProp: (prop) => prop !== 'dir' && prop !== 'size'
})<{ zoom: string, aspect: number }>(({theme, zoom, aspect}) => ({
}))

function buildImageStyle ({theme, zoom, direct}: {theme: Theme, zoom: string, direct: string}) {
    return {
        maxHeight: "calc(100vh - 64px)",
        maxWidth: "100%",
        ...(zoom === "fill" && {flexGrow: 1}),
        objectFit: "contain"
    }
}

export async function loader({
    request, params
}: LoaderFunctionArgs) {
    const photoId = parseInt(params.id ?? "")
    if (isNaN(photoId)) throw 400

    const photoData = await db.selectFrom("photos")
        .innerJoin("author", "author.author_id", "photos.author_id")
        .select(["photo_name", "photo_type", "photo_width", "photo_height", "author_name"])
        .where("photo_id", "=", photoId).executeTakeFirstOrThrow(() => {throw 404})

    return json({photo_id: photoId, ...photoData})
}

export default function ViewId() {
    const photo = useLoaderData<typeof loader>()
    const [photoSize, setPhotoSize] = useState<string>("fit")

    const handleAlignment = (event: React.MouseEvent<HTMLElement>, value: string | null,) => {
        if (value) setPhotoSize(value)
    }

    return (
        <Box sx={{display: "flex", flexDirection: "column", minHeight: "100vh", maxHeight: "100vh"}}>
            <AppBar position="static">
                <Toolbar>
                    <Chip label={photo.author_name} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, pl: 2 }}>
                        {photo.photo_name}
                    </Typography>
                    <ToggleButtonGroup
                        exclusive
                        value={photoSize}
                        onChange={handleAlignment}
                    >
                        <ToggleButton value="zoom">
                            <PhotoSizeLargeRounded/>
                        </ToggleButton>
                        <ToggleButton value="fill">
                            <FitScreenRounded/>
                        </ToggleButton>
                        <ToggleButton value="fit">
                            <AspectRatioRounded/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Toolbar>
            </AppBar>
            <Box sx={{
                flexGrow: "1",
                overflow: "auto",
                height: "100%",
                position: "relative"
            }}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    minWidth: "100%",
                    minHeight: "100%",
                    "& img": {
                        maxHeight: "calc(100vh - 64px)",
                        maxWidth: "100%",
                        ...(photoSize !== "fit" && {flexGrow: 1}),
                        objectFit: "contain",
                        ...(photoSize == "zoom" && {
                            "@media (min-aspect-ratio: 0)": {
                                minHeight: "calc(100vh - 64px)",
                                maxWidth: "none",
                            },
                            [`@media (min-aspect-ratio: ${photo.photo_width}/${photo.photo_height})`]: {
                                maxHeight: "100%",
                                maxWidth: "100%",
                            },
                        })
                    }
                }}>
                    <Img
                        zoom={photoSize}
                        aspect={photo.photo_width/photo.photo_height}
                        alt={photo.photo_name}
                        src={"/photo/".concat(
                            photo.photo_id.toString(),
                            photo.photo_type,
                            "?",
                            new URLSearchParams({
                                w: photo.photo_width.toString(),
                                h: photo.photo_height.toString()
                            }).toString()
                        )}
                        loading="lazy"
                    />
                </Box>
            </Box>
        </Box>
    )
}
