import React, {useState} from 'react';
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
    const {search, updateSearch} = props
    const [query, setQuery] = useState("")
    const [options, setOptions] = useState(false)

    const updateQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }

    const updateOptions = (option: Partial<Omit<SearchQuery, "query">>) => {
        updateSearch({
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
                                updateSearch({
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
                                <InputLabel>Order</InputLabel>
                                <Select
                                    label="Order"
                                    value={search.sort}
                                    onChange={(event) => {
                                        updateOptions({sort: event.target.value as Sort})
                                    }}
                                >
                                    <MenuItem value={"name"}>Name</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton onClick={(event) => {
                                updateOptions({order: !search.order})
                            }}>
                                {(search.order)? <ArrowUpwardRounded />: <ArrowDownwardRounded />}
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rating</InputLabel>
                            <Select
                                label="Rating"
                                value={search.rating}
                                onChange={(event) => {
                                    updateOptions({rating: event.target.value as Rating})
                                }}
                            >
                                <MenuItem value={"general"}>General</MenuItem>
                                <MenuItem value={"mature"}>Mature</MenuItem>
                                <MenuItem value={"explicit"}>Explicit</MenuItem>
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
    updateSearch: (search: SearchQuery) => void
}

export interface SearchQuery {
    query: string
    sort: Sort
    order: boolean
    rating: Rating
}

type Sort = "name"

type Rating = "general" | "mature" | "explicit"
