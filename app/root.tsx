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
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import React, {useState} from "react";
import MenuBar from "~/components/MenuBar";
import {db} from "~/db/database.server";
import themes from "~/utils/themes";
import {json} from "@remix-run/node";

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
                <CssBaseline/>
                <MenuBar open={drawer} toggle={toggleDrawer}/>
                <Box
                    sx={{
                        width: {sm: `calc(100% - ${drawer? "240px": theme.spacing(7)})`},
                        ml: {sm: `${drawer? "240px": theme.spacing(7)}`},
                    }}
                >
                    <Outlet/>
                </Box>
            </ThemeProvider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
