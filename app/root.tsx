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
import {ThemeProvider, createTheme, CssBaseline} from "@mui/material";
import React from "react";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{rel: "stylesheet", href: cssBundleHref}] : []),
];

const ThemeContext = React.createContext({
    toggleTheme: () => {
    }
})

export default function App() {
    const [mode, setMode] = React.useState<'light' | 'dark'>('dark')

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
                <Outlet/>
            </ThemeProvider>
        </ThemeContext.Provider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
        </body>
        </html>
    );
}
