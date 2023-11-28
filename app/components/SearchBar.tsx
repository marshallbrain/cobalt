import React, {useCallback, useEffect, useState} from 'react';
import {
    AppBar,
    Box,
    Collapse,
    FormControl,
    Unstable_Grid2 as Grid,
    IconButton,
    InputBase,
    InputLabel,
    MenuItem,
    Select,
    styled,
    Toolbar,
    Divider,
    Stack,
    Popover,
    Typography,
} from "@mui/material";
import SearchRounded from "~/components/icons/SearchRounded";
import ExpandMoreRounded from "~/components/icons/ExpandMoreRounded";
import ExpandLessRounded from "~/components/icons/ExpandLessRounded";
import ArrowDownwardRounded from "~/components/icons/ArrowDownwardRounded";
import ArrowUpwardRounded from "~/components/icons/ArrowUpwardRounded";
import type {SubmitFunction} from "@remix-run/react";
import {useFetcher} from "@remix-run/react";
import type {loader as settingsLoader} from "~/routes/settings";
import type {loader as suggestionsLoader} from "~/routes/suggestions";
import SearchField from "~/components/SearchField";

export default function SearchBar (props: PropTypes) {
    const {search, onSearch} = props
    const [options, setOptions] = useState(false)
    const settingsFetcher = useFetcher<typeof settingsLoader>({key: "settings"})

    useEffect(() => {
        if (settingsFetcher.state === 'idle' && !settingsFetcher.data) {
            settingsFetcher.load("/settings")
        }
    }, [settingsFetcher.state, settingsFetcher.data, settingsFetcher])

    const updateOptions = (option: Partial<Omit<SearchQuery, "query">>) => {
        onSearch({
            ...search,
            ...option
        })
    }


    return (
        <AppBar position="static">
            <Toolbar>
                <SearchField search={search} onSearch={onSearch}/>
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <IconButton size="large" color="inherit" onClick={() => {setOptions(!options)}}>
                        {(options)? <ExpandLessRounded/>: <ExpandMoreRounded/>}
                    </IconButton>
                </Box>
            </Toolbar>
            <Collapse in={options}>
                <Divider variant="middle"/>
                <Grid container spacing={2} sx={{m: 1}}>
                    <Grid xs={6}>
                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                            <FormControl fullWidth>
                                <InputLabel>Sort</InputLabel>
                                <Select
                                    label="Sort"
                                    value={search.sort ?? "name"}
                                    onChange={(event) => {
                                        updateOptions({sort: event.target.value as Sort})
                                    }}
                                >
                                    <MenuItem value={"name"}>Name</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton onClick={(event) => {
                                updateOptions({order: search.order !== "true"})
                            }}>
                                {(search.order === "true")? <ArrowUpwardRounded />: <ArrowDownwardRounded />}
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rating</InputLabel>
                            <Select
                                label="Rating"
                                value={search.rating ?? 0}
                                onChange={(event) => {
                                    updateOptions({rating: event.target.value as number})
                                }}
                            >
                                {settingsFetcher.data?.ratings.map((value, index) => (
                                    <MenuItem key={index} value={index}>{value}</MenuItem>
                                ))}
                                <MenuItem value={settingsFetcher.data?.ratings.length ?? 0}>All</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Collapse>
        </AppBar>
    )
}

interface PropTypes {
    search: SearchQuery
    onSearch:  SubmitFunction
}

export type SearchQuery = Partial<{
    query: string
    sort: Sort
    order: boolean | string
    rating: number
}>

type Sort = "name"
