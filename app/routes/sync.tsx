import React from 'react';
import type {MetaFunction} from "@remix-run/node";
import TabLinks from "~/components/TabLinks";
import {Outlet} from "@remix-run/react";

export const meta: MetaFunction = () => {return [{ title: "Sync" }]}

const tabs = [
    {label: "Import"},
    {label: "Logs"}
]

export default function Sync() {
    return (
        <>
            <TabLinks tabs={tabs} parent={"/sync"}/>
            <Outlet/>
        </>
    )
}
