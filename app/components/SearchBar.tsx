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
        padding: theme.spacing(1, 1, 1, 2),
        marginLeft: `calc(1em)`,
        width: '100%',
    },
}))

const ExistingQuery = styled("span")(({ theme }) => ({
    color: theme.palette.text.disabled
}))

const SuggestField = styled("span")(({ theme }) => ({
    color: theme.palette.secondary.main
}))

const SuggestWord = styled("span")(({ theme }) => ({
    color: theme.palette.primary.main
}))

const fieldRegex = /\$(\w+)\s(?:\w+\s?)*$/
const fromRegex = /(\w+)$/

export default function SearchBar (props: PropTypes) {
    const {search, onSearch} = props
    const [query, setQuery] = useState(search.query ?? "")
    const [options, setOptions] = useState(false)
    const [suggestAnchor, setSuggestAnchor] = React.useState<null | HTMLElement>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [suggestField, setSuggestField] = useState("")
    const [suggestFrom, setSuggestFrom] = useState<{word: string, line: string}>({word: "", line: ""})
    const settingsFetcher = useFetcher<typeof loader>({key: "settings"})
    const suggestFetcher = useFetcher()

    useEffect(() => {
        if (settingsFetcher.state === 'idle' && !settingsFetcher.data) {
            settingsFetcher.load("/settings")
        }
    }, [settingsFetcher.state, settingsFetcher.data, settingsFetcher])

    const updateQuery = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const value = event.target.value
        setQuery(value)

        if (!event.target.selectionStart) return null
        const line = value.substring(0, event.target.selectionStart)

        const field = line.match(fieldRegex)
        if (!field) return null

        const from = line.match(fromRegex)
        if (!from) return null

        setSuggestField(field[1])
        setSuggestFrom({word: from[1], line})
        return event.currentTarget
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
                        onChange={event => setSuggestAnchor(updateQuery(event))}
                        onBlur={() => {console.log("unselected")}}
                        onKeyDown={(event) => {if (event.key === "Enter") {
                            event.preventDefault()
                            event.currentTarget.blur()
                            onSearch({
                                ...search,
                                query
                            })
                        }}}
                    />
                </Search>
                <Popover
                    open={Boolean(suggestAnchor)}
                    anchorEl={suggestAnchor}
                    onClose={() => setSuggestAnchor(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    disableAutoFocus
                    disableEnforceFocus
                >
                    {Boolean(suggestAnchor) && <Typography sx={{px: 2, py: 1}}>
                        <ExistingQuery>
                            {query.substring(0, suggestFrom.line.lastIndexOf("$" + suggestField))}
                        </ExistingQuery>
                        <SuggestField>{"$" + suggestField}</SuggestField>
                        <ExistingQuery>
                            {query.substring(
                                suggestFrom.line.lastIndexOf("$" + suggestField) + "$".concat(suggestField).length,
                                suggestFrom.line.lastIndexOf(suggestFrom.word)
                            )}
                        </ExistingQuery>
                        <SuggestWord>{suggestFrom.word}</SuggestWord>
                    </Typography>}
                </Popover>
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
