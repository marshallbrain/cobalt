import React from 'react';
import type {MetaFunction} from "@remix-run/node";
import TabLinks from "~/components/TabLinks";

export const meta: MetaFunction = () => {return [{ title: "Sync" }]}

const tabs = [
    {label: "Import"},
    {label: "Logs"}
]

export default function Sync() {
    return (
        <>
            <TabLinks tabs={tabs} parent={"/sync"}/>
        </>
    )
}
