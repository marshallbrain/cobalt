import React, {ChangeEventHandler, SyntheticEvent, useEffect, useState} from 'react';
import SearchRounded from "~/components/icons/SearchRounded";
import {
    Autocomplete, Badge, Box, Chip,
    InputBase,
    InputProps,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popover,
    Popper, PopperProps,
    styled,
    Typography
} from "@mui/material";
import {SubmitFunction, useFetcher} from "@remix-run/react";
import {loader as suggestionsLoader} from "~/routes/suggestions";
import {SearchQuery} from "~/components/SearchBar";

const fieldRegex = /\$(\w+)\s(?:\w+\s?)*$/
const fromRegex = /\$?(\w*)$/
const replaceFromRegex = /(\w*)$/

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

const AutocompleteInput = styled(InputBase)(({ theme }) => ({
    color: theme.palette.common.white,
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 2),
        marginLeft: `calc(1em)`,
        width: '100%',
    },
}))

const AutocompletePopper = styled(Popper)(({ theme }) => ({
    marginLeft: theme.spacing(2) + " !important",
    width: "fit-content !important"
}))

function PopperComponent(props: PopperProps) {
    return <AutocompletePopper {...props} placement={"bottom-start"}/>;
}

const ExistingQuery = styled("span")(({ theme }) => ({
    color: theme.palette.text.disabled
}))

const SuggestField = styled("span")(({ theme }) => ({
    color: theme.palette.secondary.main
}))

const SuggestWord = styled("span")(({ theme }) => ({
    color: theme.palette.primary.main
}))

export default function SearchField (props: PropTypes) {
    const {search, onSearch} = props
    const [query, setQuery] = useState(search.query ?? "")
    const [subquery, setSubquery] = useState<Subquery>({index: 0, from: ""})
    const [suggestions, setSuggestions] = useState<Suggestions[]>([])
    const [pendingFetch, setPendingFetch] = useState<string|undefined>(undefined)
    const suggestFetcher = useFetcher<typeof suggestionsLoader>()

    useEffect(() => {
        if (suggestFetcher.state != "idle") return
        if (suggestFetcher.data) {
            setSuggestions(suggestFetcher.data)
        }
        // console.log(pendingFetch, "-")
        if (pendingFetch) {
            const splitIndex = pendingFetch.lastIndexOf(":")
            suggestFetcher.load("/suggestions?".concat(new URLSearchParams((splitIndex >= 0)?
                {from: pendingFetch.substring(0, splitIndex), field: pendingFetch.substring(splitIndex+1)}:
                {from: pendingFetch}
            ).toString()))
            setPendingFetch(undefined)
        }
    }, [pendingFetch, subquery, suggestFetcher])

    const autoComplete = (event: SyntheticEvent<Element, Event>, value: string | {label: string} | null) => {
        if (!value) return
        const substring = query.substring(0, subquery.index)
            .replace(replaceFromRegex, (value as {label: string}).label)

        setSuggestions([])
        setQuery(substring.concat(query.substring(subquery.index)))
    }

    const updateQuery: UpdateQuery = (onChange) => (event) => {
        if (onChange) onChange(event)
        setQuery(event.target.value)

        const value = event.target.value.substring(0, event.target.selectionStart || 0)
        const fromValue = value.match(fromRegex)
        const fieldValue = value.match(fieldRegex)

        if (!fromValue) return setSuggestions([])
        if (fromValue[0].startsWith("$")) {
            setPendingFetch("$".concat(fromValue[1]))
            setSubquery({
                index: event.target.selectionStart || 0,
                from: value.substring(0, value.lastIndexOf(fromValue[0]))
            })
            return
        }
        if (!fieldValue || !fieldValue[0]) return setSuggestions([])
        setPendingFetch(fromValue[1].concat(":", fieldValue[1]))
        setSubquery({
            index: event.target.selectionStart || 0,
            from: value.substring(value.lastIndexOf("$" + fieldValue[1]), value.lastIndexOf(fromValue[1])),
            field: value.substring(0, value.lastIndexOf("$" + fieldValue[1]))
        })
    }

    return (
        <Search>
            <SearchIconWrapper>
                <SearchRounded />
            </SearchIconWrapper>
            <Autocomplete
                disablePortal
                freeSolo
                options={suggestions}
                value={{label: query || ""}}
                inputValue={query}
                onChange={autoComplete}
                PopperComponent={PopperComponent}
                filterOptions={(x) => x}
                renderOption={(props, option) => (
                    <Box component="li" {...props}>
                        <Chip label={option.label}/>
                        {option.count && <>
                            <Box sx={{pl: 2, flexGrow: 1}}/>
                            <Typography variant="body2" color="text.secondary">{option.count}</Typography>
                        </>}
                    </Box>
                )}
                renderInput={(params) => (
                    <AutocompleteInput
                        ref={params.InputProps.ref}
                        inputProps={params.inputProps}
                        placeholder="Search"
                        onChange={updateQuery(params.inputProps.onChange)}
                        onKeyDown={(event) => {if (event.key === "Enter") {
                            // if (suggestions.length == 0) onSearch({
                            //     ...search,
                            //     query
                            // })
                        }}}
                    />
                )}
            />
        </Search>
    )
}

type UpdateQuery =
    (onChange: ChangeEventHandler<HTMLInputElement> | undefined) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void

interface Subquery {
    index: number,
    from: string,
    field?: string
}

interface Suggestions {
    label: string
    count?: number
}

interface PropTypes {
    search: SearchQuery
    onSearch:  SubmitFunction
}
