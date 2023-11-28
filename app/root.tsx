import {cssBundleHref} from "@remix-run/css-bundle";
import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useFetcher, useLoaderData,
} from "@remix-run/react";
import type {ThemeOptions} from "@mui/material";
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import SideMenu, {MenuLayout} from "~/components/SideMenu";
import {db} from "~/db/database.server";
import themes from "~/utils/themes";
import {json} from "@remix-run/node";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
]

export async function loader(
    {request}: LoaderFunctionArgs
) {
    const {theme} = await db.selectFrom("settings")
        .select(["theme"])
        .executeTakeFirstOrThrow().catch(() => {throw json("Not Found", {status: 404})})

    return json({
        themeOptions: themes[(theme in themes) ? theme : "dark"]
    })
}

const layout: MenuLayout[] = [
    {text: "Gallery", url: "/gallery", icon: "insertPhoto"},
    {text: "Sync", url: "/sync", icon: "sync"},
    {text: "Settings", url: "/settings", icon: "settings"}
]

export default function App() {
    const [drawer, setDrawer] = useState(false)
    const {themeOptions} = useLoaderData<typeof loader>()
    const theme = createTheme(themeOptions as ThemeOptions)

    const toggleDrawer = () => {
        setDrawer(!drawer)
    }

    return (
        <html lang="en">
        <head>
            <title></title>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch"
            }}>
                <Box sx={{
                    flexBasis: (drawer) ? 240 : theme.spacing(7),
                    minWidth: (drawer) ? 240 : theme.spacing(7),
                    overflow: 'hidden',
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    transition: theme.transitions.create(["min-width", "flex-basis"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    })
                }}>
                    <SideMenu open={drawer} toggle={toggleDrawer} layout={layout}/>
                </Box>
                <Box sx={{
                    display: "block",
                    flexGrow: 1
                }}>
                    <Outlet/>
                </Box>
            </Box>
        </ThemeProvider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
