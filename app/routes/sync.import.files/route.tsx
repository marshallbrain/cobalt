import type {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import EventEmitter from "eventemitter3";
import { eventStream } from "remix-utils/sse/server";
import {json} from "@remix-run/node";
import {readdir} from "fs/promises";
import path from "path";
import {originals} from "~/utils/utilities";
import importPhoto, {isPhoto} from "~/routes/sync.import.files/photos";

const importLogger = new EventEmitter()

export async function loader(
    {request}: LoaderFunctionArgs
) {
    return eventStream(request.signal, (send) => {
        const progress = (file: {path: string, name: string}, value: string) => {
            const filePath = path.join(file.path, file.name)
            send({ event: "progress", data: `${filePath}//${value}` })
        }

        importLogger.on("progress", progress)
        return () => importLogger.off("progress", progress)
    })
}

export async function action({
    request
}: ActionFunctionArgs) {
    const {folder, full} = Object.fromEntries(await request.formData())

    if (!originals) json({ok: false})
    readdir(
        path.join(originals ?? "", folder as string),
        {withFileTypes: true}
    ).then(async files => {
        files = files.filter(file => file.isFile() && isPhoto(file.name))
        const total = files.length
        let i = 0
        for (const file of files) {
            await importPhoto(file.name, file.path, (full === "true"))
            const progress = (++i) / total
            importLogger.emit("progress", file, Math.floor(progress * 100))
        }

        // const timer = setInterval(() => {
        //     const progress = (total - files.length + 1) / total
        //     importLogger.emit("progress", files.pop(), Math.floor(progress * 100))
        //     if (files.length == 0) clearInterval(timer)
        // }, 500)
    })

    return json({ok: true})
}
