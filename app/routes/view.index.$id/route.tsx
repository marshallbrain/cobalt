import React, {useEffect, useState} from 'react';
import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import ViewBars from "~/routes/view.index.$id/ViewBars";
import {useLoaderData, useNavigate, useParams, useSearchParams} from "@remix-run/react";
import {json} from "@remix-run/node";
import type {IIdleTimerProps} from "react-idle-timer";
import { useIdleTimer} from "react-idle-timer";
import ViewImage from "~/routes/view.index.$id/ViewImage";
import {searchPhotos} from "~/db/searchPhotos.server";
import {db} from "~/db/database.server";

export const meta: MetaFunction = () => {
    return [{title: "Route"}]
}

export async function loader({
    request, params
}: LoaderFunctionArgs) {
    const search = new URL(request.url).searchParams
    const index = parseInt(params.id ?? "")
    if (isNaN(index) || index < 0) throw 404

    const photo = await searchPhotos({
        query: search.get("query") ?? "",
        rating: parseInt(search.get("rating") ?? "0"),
        sort: search.get("sort") ?? "name",
        order: search.has("order", "true") ?? false,
        offset: index,
        limit: 2,
    }).execute()

    if (!photo[0]) throw 404

    return json({
        prev: index-1 >= 0,
        next: photo.length > 1,
        photo_id: photo[0].photo_id,
        ...await db.selectFrom("photos")
            .innerJoin("author", "author.author_id", "photos.author_id")
            .select(["photo_name", "photo_type", "photo_width", "photo_height", "author_name"])
            .where("photo_id", "=", photo[0].photo_id).executeTakeFirstOrThrow()
    })
}

export default function Route() {
    const photo = useLoaderData<typeof loader>()
    const searchIndex = parseInt(useParams().id ?? "")
    const [searchParams] = useSearchParams()
    const [photoZoom, setPhotoZoom] = useState<PhotoZoom>("fit")
    const [show, setShow] = useState(true)
    const prevImage = photo.prev && "/view/index/" + (searchIndex-1) + "?" + searchParams
    const nextImage = photo.next && "/view/index/" + (searchIndex+1) + "?" + searchParams
    const navigate = useNavigate()

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.repeat) return
            switch (event.key) {
                case "ArrowRight":
                    if (nextImage) navigate(nextImage)
                    break
                case "ArrowLeft":
                    if (prevImage) navigate(prevImage)
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
