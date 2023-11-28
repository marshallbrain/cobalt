import React from 'react';
import {Box, IconButton, styled, List, Divider} from "@mui/material";
import ChevronLeftRounded from "~/components/icons/ChevronLeftRounded";
import DrawerItem from "~/components/DrawerItem";
import InsertPhotoRounded from "~/components/icons/InsertPhotoRounded";
import SettingsRounded from "~/components/icons/SettingsRounded";
import SyncRounded from "~/components/icons/SyncRounded";
import ChevronRightRounded from "~/components/icons/ChevronRightRounded";
import DrawerParentItem from "~/components/DrawerParentItem";

const DrawerHeader = styled("div")(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(4, 1),
}))

const DrawerFooter = styled("div")(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: "flex-end",
    padding: theme.spacing(1, 1)
}))

const SideMenu = (props: PropTypes) => {

    const {open, toggle, layout} = props

    return (
        <>
            <DrawerHeader>
            </DrawerHeader>
            <Divider/>
            <Box sx={{
                display: "flex",
                overflowY: "auto",
                overflowX: 'hidden',
                flexDirection: "column",
                alignItems: "stretch"
            }}>
                <List disablePadding>
                    {layout.map((item) => {
                        if (item.children) return <></>
                        return <DrawerItem key={item.url} text={item.text} url={item.url} icon={icons[item.icon]}/>
                    })}
                </List>
            </Box>

            <Box sx={{flexGrow: 1}}/>
            <Divider/>
            <DrawerFooter>
                <IconButton onClick={toggle}>
                    {(open)? <ChevronLeftRounded/>: <ChevronRightRounded/>}
                </IconButton>
            </DrawerFooter>
        </>
    )
}

const icons = {
    insertPhoto: <InsertPhotoRounded/>,
    sync: <SyncRounded/>,
    settings: <SettingsRounded/>
} as const

export interface MenuLayout {
    text: string
    url: string
    icon: keyof typeof icons
    children?: {
        text: string
        url: string
        icon: keyof typeof icons
    }[]
}

interface PropTypes {
    open: boolean
    toggle: () => void
    layout: MenuLayout[]
}

export default SideMenu
