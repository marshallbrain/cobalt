import React, {ChangeEventHandler, SyntheticEvent, useEffect, useState} from 'react';
import SearchRounded from "~/components/icons/SearchRounded";
import {
    Autocomplete,
    InputBase,
    InputProps,
    ListItemText,
    MenuItem,
    MenuList,
    Paper,
    Popover,
    Popper,
    styled,
    Typography
} from "@mui/material";
import {SubmitFunction, useFetcher} from "@remix-run/react";
import {loader as suggestionsLoader} from "~/routes/suggestions";
import {SearchQuery} from "~/components/SearchBar";

const fieldRegex = /\$(\w+)\s(?:\w+\s?)*$/
const fromRegex = /\$?(\w*)$/

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

const AutocompletePaper = styled(Paper)(({ theme }) => ({
    marginLeft: theme.spacing(2)
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

export default function SearchField (props: PropTypes) {
    const {search, onSearch} = props
    const [query, setQuery] = useState(search.query ?? "")
    const [suggestions, setSuggestions] = useState<{label: string}[]>([])
    const [pendingFetch, setPendingFetch] = useState<string|undefined>(undefined)
    const suggestFetcher = useFetcher<typeof suggestionsLoader>()

    useEffect(() => {
        if (suggestFetcher.state != "idle") return
        if (suggestFetcher.data) {
            setSuggestions(suggestFetcher.data)
        }
        if (pendingFetch) {
            suggestFetcher.load("/suggestions?".concat(new URLSearchParams({
                from: pendingFetch
            }).toString()))
            setPendingFetch(undefined)
        }
    }, [pendingFetch, suggestFetcher])

    const updateQuery: UpdateQuery = (onChange) => (event) => {
        if (onChange) onChange(event)

        const value = event.target.value.substring(0, event.target.selectionStart || 0)
        const fromValue = value.match(fromRegex)
        const fieldValue = value.match(fieldRegex)
        if (!fromValue || !fromValue[0]) return setSuggestions([])
        if (fromValue[0].startsWith("$")) {
            setPendingFetch("$".concat(fromValue[1]))
        }
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
                PaperComponent={AutocompletePaper}
                filterOptions={(x) => x}
                renderInput={(params) => (
                    <AutocompleteInput
                        ref={params.InputProps.ref}
                        inputProps={params.inputProps}
                        placeholder="Search"
                        onChange={updateQuery(params.inputProps.onChange)}
                    />
                )}
                onKeyDown={(event) => {if (event.key === "Enter") {
                    onSearch({
                        ...search,
                        query
                    })
                }}}
            />
        </Search>
    )
}

type UpdateQuery =
    (onChange: ChangeEventHandler<HTMLInputElement> | undefined) =>
        (event: React.ChangeEvent<HTMLInputElement>) => void

interface Suggestions {
    from: string
    values: {value: string}[]
}

interface PropTypes {
    search: SearchQuery
    onSearch:  SubmitFunction
}
