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
    const {} = props
    const [options, setOptions] = useState(false)

    const toggleOptions = () => {
        setOptions(!options)
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
                    />
                </Search>
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <IconButton size="large" color="inherit" onClick={toggleOptions}>
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
                                <Select label="Order">
                                    <MenuItem value={"name"}>Name</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton>
                                <ArrowDownwardRounded />
                            </IconButton>
                        </Stack>
                    </Grid>
                    <Grid xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Rating</InputLabel>
                            <Select label="Rating">
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
}
