import React from 'react';
import {styled} from "@mui/material";
import {PhotoZoom} from "~/routes/view.index.$id/route";

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
    minHeight: "100vh",
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

export default function ViewImage (props: PropTypes) {
    const {photo, photoZoom} = props

    return (
        <ImageDiv
            zoom={photoZoom}
            aspect={{photo_width: photo.photo_width, photo_height: photo.photo_height}}
        >
            <img
                loading="lazy"
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
            />
        </ImageDiv>
    )
}

interface PropTypes {
    photo: {photo_id: number, photo_type: string, photo_name: string, photo_width: number, photo_height: number}
    photoPreload: {photo_id: number, photo_type: string}[]
    photoZoom: PhotoZoom
}
