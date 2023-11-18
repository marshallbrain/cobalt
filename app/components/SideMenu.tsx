import React from 'react';
import type { CSSObject, Theme} from "@mui/material";
import {Box, IconButton, styled, Drawer, List, Divider} from "@mui/material";
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

    const {open, toggle} = props

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
                <List>
                    <DrawerParentItem text={"Gallery"} url={"/gallery"} icon={<InsertPhotoRounded/>} sideMenu={open}>
                        <DrawerItem text={"Gallery"} url={"/gallery"} icon={<InsertPhotoRounded/>} />
                        <DrawerItem text={"Gallery"} url={"/gallery"} icon={<InsertPhotoRounded/>} />
                        <DrawerItem text={"Gallery"} url={"/gallery"} icon={<InsertPhotoRounded/>} />
                    </DrawerParentItem>
                    <DrawerItem text={"Gallery"} url={"/gallery"} icon={<InsertPhotoRounded/>} />
                    <DrawerItem text={"Sync"} url={"/sync"} icon={<SyncRounded/>} />
                    <DrawerItem text={"Settings"} url={"/settings"} icon={<SettingsRounded/>} />
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

interface PropTypes {
    open: boolean
    toggle: () => void
}

export default SideMenu
