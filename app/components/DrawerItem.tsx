import React, {useState} from 'react';
import {
    CSSObject,
    Collapse,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SvgIconTypeMap,
    Theme
} from "@mui/material";
import {Link, useLocation} from "@remix-run/react";
import {OverridableComponent} from "@mui/types";
import ExpandMoreRounded from "~/components/icons/ExpandMoreRounded";
import ExpandLessRounded from "~/components/icons/ExpandLessRounded";

const DrawerItem = (props: PropTypes) => {
    const {text, url, icon} = props
    const location = useLocation()

    return (
        <ListItem disablePadding sx={{display: 'block',}}>
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
                    {icon}
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    )
}

interface PropTypes {
    text: string
    url: string
    icon: React.ReactNode
}

export default DrawerItem

