import React from 'react';
import {Tab, Tabs} from "@mui/material";
import {Link, useLocation} from "@remix-run/react";

export default function TabLinks(props: PropTypes) {
    const {tabs, parent} = props
    const location = useLocation()

    return (
        <Tabs value={location.pathname}>
            {tabs.map(({label}) => {
                const link = parent.concat("/", label.toLowerCase())

                return (<Tab
                    key={label}
                    label={label}
                    value={link}
                    to={link}
                    component={Link}
                />)
            })}
        </Tabs>
    )
}

interface PropTypes {
    tabs: { label: string }[]
    parent: string
}
