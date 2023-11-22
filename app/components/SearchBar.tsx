import React, {useEffect, useState} from 'react';
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
} from "@mui/material";
import SearchRounded from "~/components/icons/SearchRounded";
import ExpandMoreRounded from "~/components/icons/ExpandMoreRounded";
import ExpandLessRounded from "~/components/icons/ExpandLessRounded";
import ArrowDownwardRounded from "~/components/icons/ArrowDownwardRounded";
import ArrowUpwardRounded from "~/components/icons/ArrowUpwardRounded";
import type {SubmitFunction} from "@remix-run/react";
import {useFetcher} from "@remix-run/react";
import {loader} from "~/routes/settings";

const Search = styled('div')(({ theme }) => ({
    position: "relative",
    flexGrow: 1,
    '&:focus-within': {
        color: theme.palette.primary.main,
    },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.transitions.create("color"),
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: theme.palette.common.white,
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(2)})`,
        width: '100%',
    },
}))

export default function SearchBar (props: PropTypes) {
    const {search, onSearch} = props
    const [query, setQuery] = useState(search.query ?? "")
    const [options, setOptions] = useState(false)
    const fetcher = useFetcher<typeof loader>({key: "settings"})

    useEffect(() => {
        if (fetcher.state === 'idle' && !fetcher.data) {
            fetcher.load("/settings")
        }
    }, [fetcher.state, fetcher.data, fetcher])

    const updateQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }

    const updateOptions = (option: Partial<Omit<SearchQuery, "query">>) => {
        console.log({
            ...search,
            ...option
        })
        onSearch({
            ...search,
            ...option
        })
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <Search>
                    <SearchIconWrapper>
                        <SearchRounded />
                    </SearchIconWrapper>
                    <StyledInputBase
                        placeholder="Search"
                        value={query}
                        onChange={updateQuery}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault()
                                onSearch({
                                    ...search,
                                    query
                                })
                            }
                        }}
                    />
                </Search>
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
                                {fetcher.data?.ratings.map((value, index) => (
                                    <MenuItem key={index} value={index}>{value}</MenuItem>
                                ))}
                                <MenuItem value={fetcher.data?.ratings.length ?? 0}>All</MenuItem>
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
