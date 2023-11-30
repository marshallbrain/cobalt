import type {SelectQueryBuilder} from "kysely";
import {sql} from "kysely";
import type {DB} from "~/db/types";
import {db} from "~/db/database.server";

const searchRegex = /([\^!]?"[\w\s.*]+"%?)|([\^!]?[\w.*]+%?)|(\$\w+\s?[^$]*)/g
const filterTypeRegex = /\$(\w+!?)/g
const filterRegex = /([\^!]?"[\w\s.*]+"%?)|\s([\^!]?[\w.*]+%?)/g

export function searchPhotos(params: searchParams) {
    if (isNaN(params.offset) || isNaN(params.limit)) throw 500

    let query: Query = db.selectFrom("photos")
        .innerJoin("author", "author.author_id", "photos.author_id")
        .innerJoin("domain", "domain.domain_id", "photos.domain_id")
        .select(["photo_id", "photo_type", "photo_name", "author_name", "domain_name"])

    query = querySearch(query, params.query)
    query = query.where("photo_rating", "<=", params.rating)
    query = queryOrder(query, params.sort, params.order)

    return query.offset(params.offset).limit(params.limit)
}

function querySearch(query: Query, search: string) {
    const {terms, groups} = [...search.matchAll(searchRegex)]
        .map(term => term[1] || term[2] || term[3])
        .reduce(({terms, groups}, value): {terms: string[], groups: string[]} => {
            if (value.startsWith("$")) return {terms: [...terms], groups: [...groups, value.trim()]}
            return {terms: [...terms, value.replaceAll("\"", "")], groups: [...groups]}
        }, {terms: [], groups: []} as {terms: string[], groups: string[]})

    const filters = groups.reduce((prev, value) => {
        const filter = [...value.matchAll(filterTypeRegex)].map(term => term[1])[0]
        if (!filter) return prev
        if (!(filter.replace("!", "") in validFilters)) return prev
        if (filter.endsWith("!")) return {...prev, [filter.replace("!", "")]: ["!"]}

        return {
            ...prev,
            [filter]: [...value.matchAll(filterRegex)]
                .map(term => term[1] || term[2] || term[3])
        }
    }, {} as {[index: string]: string[]})

    terms.forEach(term => {
        query = query.where("photo_name", "ilike", "%".concat(term, "%"))
    })
    Object.entries(filters).forEach(filter => {
        query = query.where("author.author_id", "in", validFilters[filter[0]](filter[1]))
    })

    return query
}

function queryOrder(query: Query, order: string, dir: boolean) {
    const direction = (dir)? "desc": "asc"
    const naturalDir = (dir)? sql`COLLATE "custom_numeric" desc`: sql`COLLATE "custom_numeric" asc`

    switch (order) {
        default:
            return query.orderBy("photo_name", naturalDir)
                .orderBy("photo_id")
    }
}

const validFilters: {[index: string]: (values: string[]) => SelectQueryBuilder<DB, any, any>} = {
    "author": (values: string[]) => db.selectFrom("author")
        .select("author_id")
        .where(eb => eb.or(values.map(value => {
            return eb("author_name", "like", value)
        }))),
    "domain": (values: string[]) => db.selectFrom("domain")
        .select("domain_id")
        .where("domain_name", "like", values),
}

type Query = SelectQueryBuilder<
    DB,
    "photos" | "author" | "domain",
    {
        photo_id: number,
        photo_type: string,
        photo_name: string,
        author_name: string,
        domain_name: string
    }
>

interface searchParams {
    query: string
    rating: number
    sort: string
    order: boolean
    offset: number
    limit: number
}
