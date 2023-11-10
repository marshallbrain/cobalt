import {cssBundleHref} from "@remix-run/css-bundle";
import type {LinksFunction} from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";
import {ThemeProvider, createTheme, CssBaseline, Box, ThemeOptions} from "@mui/material";
import React, {useState} from "react";
import MenuBar from "~/components/MenuBar";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
]

const theme = createTheme({
    palette: {
        mode: "dark"
    }
})

export default function App() {
    const [drawer, setDrawer] = useState(false)

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
