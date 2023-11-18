import {cssBundleHref} from "@remix-run/css-bundle";
import type {LinksFunction, LoaderFunctionArgs} from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useLoaderData,
} from "@remix-run/react";
import type { ThemeOptions} from "@mui/material";
import {ThemeProvider, createTheme, CssBaseline, Box, List, styled} from "@mui/material";
import React, {useState} from "react";
import SideMenu from "~/components/SideMenu";
import {db} from "~/db/database.server";
import themes from "~/utils/themes";
import {json} from "@remix-run/node";
import DrawerItem from "~/components/DrawerItem";
import InsertPhotoRounded from "~/components/icons/InsertPhotoRounded";
import SyncRounded from "~/components/icons/SyncRounded";
import SettingsRounded from "~/components/icons/SettingsRounded";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
]

export async function loader(
    {request}: LoaderFunctionArgs
) {
    const theme = await db.selectFrom("settings")
        .select("theme")
        .limit(1)
        .execute().then(r => r[0].theme)

    return json(themes[(theme in themes)? theme: "dark"])
}

export default function App() {
    const [drawer, setDrawer] = useState(false)
    const theme = createTheme(useLoaderData<typeof loader>() as ThemeOptions)

    const toggleDrawer = () => {
        setDrawer(!drawer)
    }

    return (
        <html lang="en">
        <head>
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
                        flexBasis: (drawer)? 240:theme.spacing(7),
                        borderRight: "1px solid " + theme.palette.divider,
                        overflow: 'hidden',
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        transition: theme.transitions.create("flex-basis", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        })
                    }}>
                        <SideMenu open={drawer} toggle={toggleDrawer}/>
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
