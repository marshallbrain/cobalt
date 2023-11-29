import React, {useEffect, useState} from 'react';
import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import ViewBars from "~/routes/view.$id/ViewBars";
import {useLoaderData, useNavigate} from "@remix-run/react";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import type {IIdleTimerProps} from "react-idle-timer";
import { useIdleTimer} from "react-idle-timer";
import {styled} from "@mui/material";
import ViewImage from "~/routes/view.$id/ViewImage";

export const meta: MetaFunction = () => {
    return [{title: "Route"}]
}

export async function loader({
    request, params
}: LoaderFunctionArgs) {
    const photoId = parseInt(params.id ?? "")
    if (isNaN(photoId)) throw 400

    const photoData = await db.selectFrom("photos")
        .innerJoin("author", "author.author_id", "photos.author_id")
        .select(["photo_name", "photo_type", "photo_width", "photo_height", "author_name"])
        .where("photo_id", "=", photoId).executeTakeFirstOrThrow(() => {
            throw 404
        })

    return json({photo_id: photoId, ...photoData})
}

export default function Route() {
    const photo = useLoaderData<typeof loader>()
    const [photoZoom, setPhotoZoom] = useState<PhotoZoom>("fit")
    const [show, setShow] = useState(true)
    const prevImage = "/view/" + (photo.photo_id-1)
    const nextImage = "/view/" + (photo.photo_id+1)
    const navigate = useNavigate()

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) return
            switch (event.key) {
                case "ArrowRight":
                    navigate(nextImage)
                    break
                case "ArrowLeft":
                    navigate(prevImage)
                    break
            }
        }
        document.addEventListener("keydown", onKeyDown)

        return () => {document.removeEventListener("keydown", onKeyDown)}
    }, [navigate, nextImage, prevImage])

    const idleTimer: IIdleTimerProps = {
        onIdle: () => {
            setShow(false)
        },
        onActive: () => {
            setShow(true)
        },
        events: ["mousemove"],
        timeout: 3_000,
        throttle: 500
    }
    useIdleTimer(idleTimer)

    return (
        <>
            <ViewBars
                photo={photo}
                show={show}
                nextImage={nextImage}
                prevImage={prevImage}
                photoZoom={photoZoom}
                setPhotoZoom={value => {setPhotoZoom(value)}}
            />
            <ViewImage photo={photo} photoZoom={photoZoom} photoPreload={[]}/>
        </>
    )
}

export type PhotoZoom = "fit" | "fill" | "zoom"
