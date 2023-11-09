import React from 'react';
import {ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";

const DrawerItem = (props: PropTypes) => {

    const {text} = props

    return (
        <ListItem disablePadding sx={{ display: 'block'}}>
            <ListItemButton
                sx={{
                    minHeight: 48,
                    px: 2.5,
                    paddingX: 2
                }}
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
    text: String
    children: React.ReactNode
}

export default DrawerItem
