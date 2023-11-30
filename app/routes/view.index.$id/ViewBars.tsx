import React, {useState} from 'react';
import {
    AppBar,
    Box,
    Button,
    Chip, Paper,
    Slide,
    styled,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography
} from "@mui/material";
import PhotoSizeLargeRounded from "~/components/icons/PhotoSizeLargeRounded";
import FitScreenRounded from "~/components/icons/FitScreenRounded";
import AspectRatioRounded from "~/components/icons/AspectRatioRounded";
import ChevronLeftRounded from "~/components/icons/ChevronLeftRounded";
import {Link} from "@remix-run/react";
import ChevronRightRounded from "~/components/icons/ChevronRightRounded";
import {PhotoZoom} from "~/routes/view.index.$id/route";

const Header = styled(AppBar)(({theme}) => ({
    backgroundColor: theme.palette.background.paper.concat("99"),
}))

const Footer = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.background.paper.concat("99"),
    position: "fixed",
    zIndex: 1100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
}))

const Navigation = styled("div")(({theme}) => ({
    position: "fixed",
    zIndex: 1000,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: theme.spacing(6),
    "& .MuiButton-root": {
        padding: theme.spacing(1.5) + " " + theme.spacing(0.5),
        minWidth: 0,
        backgroundColor: theme.palette.background.paper.concat("33"),
        "& .MuiButton-endIcon": {
            margin: 0,
            padding: 0,
        }
    }
}))

export default function ViewBars(props: PropTypes) {
    const {photo, show, prevImage, nextImage, photoZoom, setPhotoZoom} = props
    const [forceShow, setForceShow] = useState<{ [index in Elements]?: boolean }>({})

    const shouldShow = (element: Elements, state: boolean) => () => {
        setForceShow(prevState => ({...prevState, [element]: state}))
    }

    const handleAlignment = (event: React.MouseEvent<HTMLElement>, value: PhotoZoom | null,) => {
        if (value) setPhotoZoom(value)
    }

    return (<>
        <Slide appear={false} direction="down" in={show || forceShow.appBar}>
            <Header
                onMouseEnter={shouldShow("appBar", true)}
                onMouseLeave={shouldShow("appBar", false)}
            >
                <Toolbar>
                    <Box sx={{flexGrow: 1}}/>
                    <ToggleButtonGroup
                        exclusive
                        value={photoZoom}
                        onChange={handleAlignment}
                    >
                        <ToggleButton value="zoom">
                            <PhotoSizeLargeRounded/>
                        </ToggleButton>
                        <ToggleButton value="fill">
                            <FitScreenRounded/>
                        </ToggleButton>
                        <ToggleButton value="fit">
                            <AspectRatioRounded/>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Toolbar>
            </Header>
        </Slide>
        <Slide appear={false} direction="up" in={show || forceShow.title}>
            <Footer
                onMouseEnter={shouldShow("title", true)}
                onMouseLeave={shouldShow("title", false)}
                sx={{
                    bottom: 0,
                    left: "auto",
                    right: 0,
                    width: "100%",
                    padding: 1
                }}
            >
                <Box sx={{visibility: "hidden"}}>
                    <Chip label={photo.author_name}/>
                </Box>
                <Typography variant="h6" component="div" sx={{px: 2}}>
                    {photo.photo_name}
                </Typography>
                <Box>
                    <Chip label={photo.author_name}/>
                </Box>
            </Footer>
        </Slide>
        <Slide appear={false} direction="right" in={show}>
            <Navigation sx={{height: "100vh", left: 0}}>
                <Button
                    disabled={!prevImage}
                    variant="outlined"
                    size="small"
                    endIcon={<ChevronLeftRounded/>}
                    color="secondary"
                    component={Link}
                    to={prevImage || ""}
                />
            </Navigation>
        </Slide>
        <Slide appear={false} direction="left" in={show}>
            <Navigation sx={{height: "100vh", right: 0}}>
                <Button
                    disabled={!nextImage}
                    variant="outlined"
                    size="small"
                    endIcon={<ChevronRightRounded/>}
                    color="secondary"
                    component={Link}
                    to={nextImage || ""}
                />
            </Navigation>
        </Slide>
    </>)
}

type Elements = "appBar" | "title"

interface PropTypes {
    photo: {photo_name: string, author_name: string}
    show: boolean
    nextImage: string | false
    prevImage: string | false
    photoZoom: PhotoZoom
    setPhotoZoom: (value: PhotoZoom) => void
}
