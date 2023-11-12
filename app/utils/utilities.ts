import * as process from "process";

export const originals = (process.env.NODE_ENV === "development")? process.env.DEV_ORIGINALS: "/originals"
