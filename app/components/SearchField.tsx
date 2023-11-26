import React, {useEffect, useState} from 'react';
import SearchRounded from "~/components/icons/SearchRounded";
import {InputBase, Popover, styled, Typography} from "@mui/material";
import {SubmitFunction, useFetcher} from "@remix-run/react";
import {loader as suggestionsLoader} from "~/routes/suggestions";
import {SearchQuery} from "~/components/SearchBar";

const fieldRegex = /\$(\w+)\s(?:\w+\s?)*$/
const fromRegex = /(\w+)$/

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

export default function SearchField (props: PropTypes) {
    const {search, onSearch} = props
    const [query, setQuery] = useState(search.query ?? "")
    const [suggestAnchor, setSuggestAnchor] = React.useState<null | HTMLElement>(null)
    const [suggestions, setSuggestions] = useState<Suggestions>({from: "", values: []})
    const [suggestField, setSuggestField] = useState("")
    const [suggestFrom, setSuggestFrom] = useState<{word: string, line: string}>({word: "", line: ""})
    const [sentSuggest, setSentSuggest] = useState(false)
    const suggestFetcher = useFetcher<typeof suggestionsLoader>()

    useEffect(() => {
        if (suggestions.from === suggestFrom.word) return
        if (sentSuggest && suggestFetcher.state == "idle" && suggestFetcher.data) {
            setSuggestions({from: suggestFrom.word, values: suggestFetcher.data})
        }
        if (!sentSuggest && suggestFetcher.state == "idle") {
            suggestFetcher.load("/suggestions?".concat(new URLSearchParams({
                field: suggestField, from: suggestFrom.word
            }).toString()))
            setSentSuggest(true)
        }
    }, [sentSuggest, suggestFetcher, suggestField, suggestFrom.word, suggestions.from])

    const updateQuery = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        setQuery(value)

        if (!event.target.selectionStart) return null
        const line = value.substring(0, event.target.selectionStart)

        const field = line.match(fieldRegex)
        const from = line.match(fromRegex)
        if (!field || !from) {
            setSuggestAnchor(null)
            return
        }

        if (!suggestAnchor)
            setSuggestions({from: "", values: []})

        setSuggestField(field[1])
        setSuggestFrom({word: from[1], line})
        setSentSuggest(false)
        return setSuggestAnchor(event.currentTarget)
    }

    return (
        <>
            <Search>
                <SearchIconWrapper>
                    <SearchRounded />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="Search"
                    value={query}
                    onChange={updateQuery}
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
                open={Boolean(suggestAnchor) && suggestions.values.length > 0}
                anchorEl={suggestAnchor}
                onClose={() => setSuggestAnchor(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                disableAutoFocus
                disableEnforceFocus
            >
                {suggestions.values.map(({value}) => (
                    <Typography sx={{px: 2, py: 1}} key={value}>
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
                        <SuggestWord>{value}</SuggestWord>
                    </Typography>
                ))}
            </Popover>
        </>
    )
}

interface Suggestions {
    from: string
    values: {value: string}[]
}

interface PropTypes {
    search: SearchQuery
    onSearch:  SubmitFunction
}
