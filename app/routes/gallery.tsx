import React from 'react';
import type {MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "Gallery" },
    ]
}

export default function Gallery() {
    return (
        <div>
        </div>
    )
}
