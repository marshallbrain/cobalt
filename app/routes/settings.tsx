import React from 'react';
import type {ActionFunctionArgs, MetaFunction} from "@remix-run/node";
import {Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation} from "@remix-run/react";
import {json, LoaderFunctionArgs} from "@remix-run/node";
import {db} from "~/db/database.server";
import {validateSettings} from "~/validators/settings";
import TabLinks from "~/components/TabLinks";
import themes from "~/utils/themes";

export const meta: MetaFunction = () => {
    return [
        {title: "Settings"},
    ]
}

const tabs = [
    {label: "General"}
]

export async function loader(
    {request}: LoaderFunctionArgs
) {
    const settings = await db.selectFrom("settings")
        .select("ratings")
        .executeTakeFirstOrThrow()

    return json(settings)
}

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
