import {Kysely, PostgresDialect, sql} from "kysely";
import pg from "pg";
import type {DB} from "~/db/types";
import * as process from "process";
import {singleton} from "~/utils/singleton.server";

const dialect = new PostgresDialect({
    pool: new pg.Pool({
        database: process.env.DATABASE_NAME,
        host: "localhost",
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: 5432,
        max: 10,
    })
})

export const db = singleton("db", () => {
    const db = new Kysely<DB>({dialect})
    db.insertInto("settings")
        .values({id: 1})
        .onConflict((oc) => oc
            .column("id")
            .doNothing()
        )
        .execute().then()
    sql`CREATE COLLATION IF NOT EXISTS custom_numeric (provider = icu, locale = 'en-u-kn-true')`
        .execute(db).then()

    return db
})
