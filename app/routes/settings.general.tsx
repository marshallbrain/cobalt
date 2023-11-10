import React from 'react';
import type {MetaFunction} from "@remix-run/node";
import {Box, FormControl, InputLabel, MenuItem, Select} from "@mui/material";

export const meta: MetaFunction = () => {
    return [
        { title: "General" },
    ]
}

export default function General() {

    return (
        <Box sx={{p: 2}}>
        </Box>
    )
}
