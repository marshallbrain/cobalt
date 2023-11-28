import React from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {AppBar, Box, Chip, styled, Toolbar, Typography} from '@mui/material';
import {db} from "~/db/database.server";
import {useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = () => {return [{ title: "ViewId" }]}

const Img = styled("img")(({theme}) => ({
    maxHeight: "calc(100vh - 64px)",
}))

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

    return (
        <Box sx={{display: "flex", flexDirection: "column", minHeight: "100vh", maxHeight: "100vh"}}>
            <AppBar position="static">
                <Toolbar>
                    <Chip label={photo.author_name} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, pl: 2 }}>
                        {photo.photo_name}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{flexGrow: "1", display: "flex", justifyContent: "center"}}>
                <Img
                    alt={photo.photo_name}
                    src={"/photo/".concat(
                        photo.photo_id.toString(),
                        photo.photo_type,
                        "?",
                        new URLSearchParams({
                            w: (photo.photo_width).toString(),
                            h: (photo.photo_height).toString()
                        }).toString()
                    )}
                    loading="lazy"
                />
            </Box>
        </Box>
    )
}
