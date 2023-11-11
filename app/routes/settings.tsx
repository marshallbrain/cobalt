import React from 'react';
import type {ActionFunctionArgs, MetaFunction} from "@remix-run/node";
import {Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation} from "@remix-run/react";
import {json} from "@remix-run/node";
import {db} from "~/db/database.server";
import {validateSettings} from "~/validators/settings";

export const meta: MetaFunction = () => {
    return [
        {title: "Settings"},
    ]
}

const tabs = [
    {label: "General", link: "/settings/general"}
]

export default function Settings() {

    const location = useLocation()

    return (
        <>
            <Tabs value={location.pathname}>
                {tabs.map((tab) => (
                    <Tab
                        key={tab.label}
                        label={tab.label}
                        value={tab.link}
                        to={tab.link}
                        component={Link}
                    />
                ))}
            </Tabs>
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
