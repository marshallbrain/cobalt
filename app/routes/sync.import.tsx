import React, {useEffect, useState} from 'react';
import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import {defer} from "@remix-run/node";
import {Box, Button, FormControl, InputLabel, LinearProgress, MenuItem, Select} from "@mui/material";
import {readdir} from "fs/promises";
import {originals} from "~/utils/utilities";
import * as path from "path";
import {useFetcher, useLoaderData} from "@remix-run/react";
import { useEventSource } from 'remix-utils/sse/react';

export const meta: MetaFunction = () => {
    return [{title: "Import"}]
}

export async function loader(
    {request}: LoaderFunctionArgs
) {
    if (!originals) throw 400

    const folderLoader = readdir(path.join(originals), {withFileTypes: true}).then(files =>
        files.filter(value => value.isDirectory())
            .map(value => path.join(value.path, value.name)
                .replaceAll("\\", "/")
                .replace(originals ?? "", "")
            )
    )
    return defer({folderLoader})
}

export default function Import() {
    const [folder, setFolder] = useState("/")
    const [folderList, setFolderList] = useState<string[]>([])
    const {folderLoader} = useLoaderData<typeof loader>()
    const fetcher = useFetcher()
    const progress: string | null = useEventSource("/sync/import/files", { event: "progress" })

    useEffect(() => {
        (async () => setFolderList(await folderLoader))()
    })

    const startScan = () => fetcher.submit({folder},
        {
            action: "/sync/import/files",
            method: "post"
        }
    )

    return (
        <Box sx={{p: 2}}>
            <FormControl fullWidth>
                <LinearProgress variant="determinate" value={parseInt(progress?.split("//").pop() ?? "0")} />
                <InputLabel>Folder</InputLabel>
                <Select
                    label="Folder"
                    onChange={event => setFolder(event.target.value as string)}
                    value={folder}
                >
                    <MenuItem value={"/"}>Scan all</MenuItem>
                    {folderList.map(folder => (
                        <MenuItem value={folder} key={folder}>{folder}</MenuItem>
                    ))}
                </Select>
                <Button variant="contained" onClick={startScan}>Start</Button>
            </FormControl>
        </Box>
    )
}
