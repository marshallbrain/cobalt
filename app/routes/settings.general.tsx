import React, {useState} from 'react';
import type {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import type { SelectChangeEvent} from "@mui/material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Unstable_Grid2 as Grid,
    Stack,
    Button, TextField, ButtonGroup, IconButton
} from "@mui/material";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {json} from "@remix-run/node";
import themes from "~/utils/themes";
import {db} from "~/db/database.server";
import ExpandMoreRounded from "~/components/icons/ExpandMoreRounded";
import ExpandLessRounded from "~/components/icons/ExpandLessRounded";
import SyncRounded from "~/components/icons/SyncRounded";

export const meta: MetaFunction = () => {
    return [
        {title: "General"},
    ]
}

export async function loader(
    {request}: LoaderFunctionArgs
) {
    const settings = await db.selectFrom("settings")
        .select(["theme"])
        .limit(1)
        .execute().then(r => r[0])

    return json(settings)
}

export default function General() {
    const [ratings, setRatings] = useState(["General", "Hidden"])

    const fetcher = useFetcher()
    const settings = useLoaderData<typeof loader>()

    const changeTheme = (event: SelectChangeEvent) => {
        fetcher.submit({theme: event.target.value},
            {
                action: "/settings",
                method: "post"
            }
        )
    }

    const saveRatings = () => {
        fetcher.submit({ratings},
            {
                action: "/settings",
                method: "post"
            }
        )
    }

    return (
        <Box sx={{p: 2}}>
            <Grid container spacing={2}>
                <Grid xs={12}>
                    <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                            value={settings.theme}
                            label="Theme"
                            onChange={changeTheme}
                        >
                            {Object.keys(themes).map(value => (
                                <MenuItem value={value} key={value}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                            <Typography>Rating Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack
                                direction="column"
                                justifyContent="center"
                                alignItems="flex-start"
                                spacing={2}
                                sx={{pb: 2}}
                            >
                                {ratings.map((rating, index) => (
                                    <Stack
                                        key={index}
                                        direction="row"
                                        justifyContent="flex-start"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        <TextField
                                            error={rating.length == 0}
                                            helperText={(rating.length == 0)? "Name can't be empty": ""}
                                            label="name"
                                            variant="outlined"
                                            value={rating}
                                            onChange={(event) => {
                                                ratings[index] = event.target.value
                                                setRatings([...ratings])
                                            }}
                                        />
                                        <ButtonGroup variant="contained">
                                            <Button disabled={index == 0} onClick={() => {
                                                const temp = ratings[index]
                                                ratings[index] = ratings[index-1]
                                                ratings[index-1] = temp
                                                setRatings([...ratings])
                                            }}>
                                                <ExpandLessRounded/>
                                            </Button>
                                            <Button disabled={index+1 == ratings.length} onClick={() => {
                                                const temp = ratings[index]
                                                ratings[index] = ratings[index+1]
                                                ratings[index+1] = temp
                                                setRatings([...ratings])
                                            }}>
                                                <ExpandMoreRounded/>
                                            </Button>
                                        </ButtonGroup>
                                        <IconButton onClick={() => {
                                            ratings.splice(index, 1)
                                            setRatings([...ratings])
                                        }}>
                                            <SyncRounded/>
                                        </IconButton>
                                    </Stack>
                                ))}
                                <Button variant="contained" onClick={() => setRatings([...ratings, ""])}>
                                    Add Rating
                                </Button>
                            </Stack>
                            <Button
                                variant="outlined"
                                disabled={ratings.some(value => value.length == 0)}
                                onClick={() => saveRatings}
                            >
                                Save
                            </Button>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
        </Box>
    )
}
