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
import {ThemeProvider, createTheme, CssBaseline, Box} from "@mui/material";
import React, {useState} from "react";
import MenuBar from "~/components/MenuBar";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
];

const ThemeContext = React.createContext({
    toggleTheme: () => {
    }
})

export default function App() {
    const [mode, setMode] = useState<'light' | 'dark'>('dark')
    const [drawer, setDrawer] = useState(false)

    const toggleDrawer = () => {
        setDrawer(!drawer)
    }

    const colorMode = React.useMemo(
        () => ({
            toggleTheme: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
            },
        }),
        [],
    )

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    )

    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
        </head>
        <body>
        <ThemeContext.Provider value={colorMode}>
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
        </ThemeContext.Provider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
