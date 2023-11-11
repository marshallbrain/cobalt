import React from 'react';
import type { CSSObject, Theme} from "@mui/material";
import {Box, IconButton, styled, Drawer, List, Divider} from "@mui/material";
import ChevronLeftRounded from "~/components/icons/ChevronLeftRounded";
import DrawerItem from "~/components/DrawerItem";
import InsertPhotoRounded from "~/components/icons/InsertPhotoRounded";
import SettingsRounded from "~/components/icons/SettingsRounded";
import SyncRounded from "~/components/icons/SyncRounded";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)})`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(7)})`,
    },
});

const MiniDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open}) => ({
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
)

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(4, 1),
}))

const DrawerFooter = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
}))

const MenuBar = (props: PropTypes) => {

    const {open, toggle} = props

    return (
        <Box sx={{ display: 'flex' }}>
            <MiniDrawer
                variant="permanent"
                open={open}
            >
                <DrawerHeader>
                </DrawerHeader>
                <Divider/>
                <List>
                    <DrawerItem text={"Gallery"} url={"/gallery"}>
                        <InsertPhotoRounded/>
                    </DrawerItem>
                    <DrawerItem text={"Sync"} url={"/sync"}>
                        <SyncRounded/>
                    </DrawerItem>
                    <DrawerItem text={"Settings"} url={"/settings"}>
                        <SettingsRounded/>
                    </DrawerItem>
                </List>
                <Box sx={{flexGrow: 1}}/>
                <DrawerFooter>
                    <IconButton onClick={toggle}>
                        <ChevronLeftRounded/>
                    </IconButton>
                </DrawerFooter>
            </MiniDrawer>
        </Box>
    )
}

interface PropTypes {
    open: boolean
    toggle: () => void
}

export default MenuBar
