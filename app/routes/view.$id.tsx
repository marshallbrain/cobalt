import React, {useState} from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import type {Theme} from '@mui/material';
import {
    AppBar,
    Box,
    Chip,
    Paper,
    Slide,
    styled,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography
} from '@mui/material';
import {db} from "~/db/database.server";
import {useLoaderData} from "@remix-run/react";
import AspectRatioRounded from "~/components/icons/AspectRatioRounded";
import FitScreenRounded from "~/components/icons/FitScreenRounded";
import PhotoSizeLargeRounded from '~/components/icons/PhotoSizeLargeRounded';
import type {IIdleTimerProps} from "react-idle-timer";
import {useIdleTimer} from "react-idle-timer";

export const meta: MetaFunction = () => {
    return [{title: "ViewId"}]
}

const ImageDiv = styled("div", {
    shouldForwardProp: (prop) => prop !== 'zoom' && prop !== 'aspect'
})<{
    zoom: string,
    aspect: { photo_width: number, photo_height: number }
}>(({theme, zoom: size, aspect}) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "100%",
    minHeight: "100%",
    "& img": {
        maxHeight: "100vh",
        maxWidth: "100%",
        ...(size !== "fit" && {flexGrow: 1}),
        objectFit: "contain",
        ...(size == "zoom" && {
            "@media (min-aspect-ratio: 0)": {
                minHeight: "100vh",
                maxWidth: "none",
            },
            [`@media (min-aspect-ratio: ${aspect.photo_width}/${aspect.photo_height})`]: {
                maxHeight: "100%",
                maxWidth: "100%",
            },
        })
    }
}))

const Footer = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.background.paper.concat("99"),
    position: "fixed",
    zIndex: 1100,
    bottom: 0,
    left: "auto",
    right: 0,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1)
}))

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

export default function ViewId() {
    const photo = useLoaderData<typeof loader>()
    const [photoSize, setPhotoSize] = useState<string>("fit")
    const [forceShow, setForceShow] = useState<{ [index in Elements]?: boolean }>({})
    const [show, setShow] = useState(true)

    const handleAlignment = (event: React.MouseEvent<HTMLElement>, value: string | null,) => {
        if (value) setPhotoSize(value)
    }

    const shouldShow = (element: Elements, state: boolean) => () => {
        setForceShow(prevState => ({...prevState, [element]: state}))
    }

    const idleTimer: IIdleTimerProps = {
        onIdle: () => {
            setShow(false)
        },
        onActive: () => {
            setShow(true)
        },
        timeout: 3_000,
        throttle: 500
    }
    useIdleTimer(idleTimer)

    return (
        <>
            <Slide appear={false} direction="down" in={show || forceShow.appBar}>
                <AppBar
                    onMouseEnter={shouldShow("appBar", true)}
                    onMouseLeave={shouldShow("appBar", false)}
                >
                    <Toolbar>
                        <Box sx={{flexGrow: 1}}/>
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
            </Slide>
            <Slide appear={false} direction="up" in={show || forceShow.appBar}>
                <Footer
                    onMouseEnter={shouldShow("title", true)}
                    onMouseLeave={shouldShow("title", false)}
                >
                    <Typography variant="h6" component="div" sx={{pr: 2}}>
                        {photo.photo_name}
                    </Typography>
                    <Chip label={photo.author_name}/>
                </Footer>
            </Slide>
            <ImageDiv zoom={photoSize} aspect={{photo_width: photo.photo_width, photo_height: photo.photo_height}}>
                <img
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
            </ImageDiv>
        </>
    )
}

type Elements = "appBar" | "title"
