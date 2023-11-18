import React from 'react';
import type {ActionFunctionArgs, MetaFunction} from "@remix-run/node";
import {Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation} from "@remix-run/react";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import {validateSettings} from "~/validators/settings";
import TabLinks from "~/components/TabLinks";

export const meta: MetaFunction = () => {
    return [
        {title: "Settings"},
    ]
}

const tabs = [
    {label: "General"}
]

export default function Settings() {

    return (
        <>
            <TabLinks tabs={tabs} parent={"/settings"}/>
            <Outlet/>
        </>
    )
}

export async function action({
    request
}: ActionFunctionArgs) {
    const formData = Object.fromEntries(await request.formData())
    const settings = validateSettings(formData)

    await db.updateTable("settings")
        .set(settings)
        .execute()

    return json({ok: true})
}
