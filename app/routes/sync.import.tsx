import React, {useEffect, useState} from 'react';
import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import {defer} from "@remix-run/node";
import {Box, Button, Checkbox, FormControl,
    FormControlLabel, FormGroup, InputLabel, LinearProgress, MenuItem, Select, Typography} from "@mui/material";
import {readdir} from "fs/promises";
import {originals} from "~/utils/utilities";
import * as path from "path";
import {useFetcher, useLoaderData} from "@remix-run/react";
import { useEventSource } from 'remix-utils/sse/react';
import {Stack} from "@mui/system";

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
    const [options, setOptions] = useState({full: false, clean: false})
    const [folderList, setFolderList] = useState<string[]>([])
    const {folderLoader} = useLoaderData<typeof loader>()
    const fetcher = useFetcher()
    const progress: string | null = useEventSource("/sync/import/files", { event: "progress" })

    useEffect(() => {
        (async () => setFolderList(await folderLoader))()
    })

    const startScan = () => fetcher.submit(
        {
            folder,
            ...options
        },
        {
            action: "/sync/import/files",
            method: "post"
        }
    )

    const changeOptions = (option: "full" | "clean") => (event: React.SyntheticEvent<Element, Event>, checked: boolean) => {
        options[option] = checked
        setOptions({...options})
    }

    return (
        <Stack
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={2}
            sx={{
                p: 2
            }}
        >
            <Typography variant="body1" gutterBottom>{progress?.split("//")[0] ?? "No photos processed"}</Typography>
            <FormControl fullWidth>
                <LinearProgress variant="determinate" value={parseInt(progress?.split("//").pop() ?? "0")} />
            </FormControl>
            <FormControl fullWidth>
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
            </FormControl>
            <FormGroup row>
                <FormControlLabel
                    control={<Checkbox />}
                    label="Full scan"
                    checked={options.full}
                    onChange={changeOptions("full")
                }/>
                <FormControlLabel
                    control={<Checkbox />}
                    label="Clean up"
                    checked={options.clean}
                    onChange={changeOptions("clean")}
                    disabled
                />
            </FormGroup>
            <Button variant="contained" onClick={startScan}>Start</Button>
        </Stack>
    )
}
