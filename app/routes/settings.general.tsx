import React from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import type { SelectChangeEvent} from "@mui/material";
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import themes from "~/utils/themes";
import {db} from "~/db/database.server";

export const meta: MetaFunction = () => {
    return [
        {title: "General"},
    ]
}

export async function loader(
    {request}: LoaderFunctionArgs
) {
    const settings = await db.selectFrom("settings")
        .select(["theme"])
        .limit(1)
        .execute().then(r => r[0])

    return json(settings)
}

export default function General() {

    const fetcher = useFetcher()
    const settings = useLoaderData<typeof loader>()

    const changeTheme = (event: SelectChangeEvent) => {
        fetcher.submit({theme: event.target.value},
            {
                action: "/settings",
                method: "post"
            }
        )
    }

    return (
        <Box sx={{p: 2}}>
            <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                    value={settings.theme}
                    label="Theme"
                    onChange={changeTheme}
                >
                    {Object.keys(themes).map(value => (
                        <MenuItem value={value} key={value}>{value}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}
