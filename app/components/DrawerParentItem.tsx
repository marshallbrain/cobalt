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

const DrawerParentItem = (props: PropTypes) => {
    const {text, url, icon, sideMenu} = props
    const [open, setOpen] = useState(false)
    const location = useLocation()

    const toggleNested = () => {
        setOpen(!open)
    }

    return (
        <>
            <ListItem
                disablePadding
                secondaryAction={(
                    <IconButton edge="end" onClick={toggleNested}>
                        {(open)? <ExpandLessRounded/>: <ExpandMoreRounded/>}
                    </IconButton>
                )}
                sx={{
                    display: 'block',
                    "& .MuiListItemSecondaryAction-root": {
                        left: "max(calc(100% - 44px), 190px)"
                    }
                }}
            >
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
            <Collapse in={open && sideMenu} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 4 }}>
                    {props.children}
                </List>
            </Collapse>
        </>
    )
}

interface PropTypes {
    text: string
    url: string
    icon: React.ReactNode
    sideMenu: boolean
    children: React.ReactNode
}

export default DrawerParentItem
