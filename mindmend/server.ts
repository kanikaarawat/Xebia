import { createServer } from "http"
import { parse } from "url"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = Number.parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url!, true)
                await handle(req, res, parsedUrl)
            } catch (err) {
                console.error("Error occurred handling", req.url, err)
                res.statusCode = 500
                res.end("internal server error")
            }
        })

        // Store the HTTP server globally so Socket.IO can access it
    ;(global as any).httpServer = server

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})