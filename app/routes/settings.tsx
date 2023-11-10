import React from 'react';
import type {MetaFunction} from "@remix-run/node";
import {Tab, Tabs} from "@mui/material";
import {Link, Outlet, useLocation} from "@remix-run/react";

export const meta: MetaFunction = () => {
    return [
        { title: "Settings" },
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
