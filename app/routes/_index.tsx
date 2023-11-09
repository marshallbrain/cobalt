import type { MetaFunction } from "@remix-run/node";
import {AppBar, Toolbar, Typography} from "@mui/material";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
      <div>
              <AppBar position="static">
                  <Toolbar>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          Gallery
                      </Typography>
                  </Toolbar>
              </AppBar>
      </div>
  )
}
