import React from 'react';
import {ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {Link, useLocation} from "@remix-run/react";

const DrawerItem = (props: PropTypes) => {

    const {text, url} = props
    const location = useLocation()

    return (
        <ListItem disablePadding sx={{ display: 'block'}}>
            <ListItemButton
                to={url}
                sx={{
                    minHeight: 48,
                    px: 2.5,
                    paddingX: 2
                }}
                component={Link}
                selected={location.pathname.startsWith(url)}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: 3,
                        justifyContent: 'center',
                    }}
                >
                    {props.children}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    )
}

interface PropTypes {
    text: string
    url: string
    children: React.ReactNode
}

export default DrawerItem
