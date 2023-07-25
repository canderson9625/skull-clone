import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import * as io from 'socket.io';
// import Server from 'socket.io'

const app = express();
const httpServer = http.createServer(app);
const ws = new io.Server(httpServer, {cors: { origin: '127.0.0.1'}});
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const resolve = (p) => path.resolve(__dirname, p)

// console.log(ws);

async function createServer() {

    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
    });

    // Use vite's connect instance as middleware. If you use your own
    // express router (express.Router()), you should use router.use
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;

        try {
            // 1. Read index.html
            let template = fs.readFileSync(
                path.resolve(__dirname, 'index.html'),
                'utf-8'
            );

            // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
            //    and also applies HTML transforms from Vite plugins, e.g. global
            //    preambles from @vitejs/plugin-react
            template = await vite.transformIndexHtml(url, template);

            // 3. Load the server entry. ssrLoadModule automatically transforms
            //    ESM source code to be usable in Node.js! There is no bundling
            //    required, and provides efficient invalidation similar to HMR.
            const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

            // 4. render the app HTML. This assumes entry-server.jsx's exported
            //     `render` function calls appropriate framework SSR APIs,
            //    e.g. ReactDOMServer.renderToString()
            const appHtml = await render(url);

            // 5. Inject the app-rendered HTML into the template.
            const html = template.replace(`<!--ssr-outlet-->`, appHtml);

            // 6. Send the rendered HTML back.
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            // If an error is caught, let Vite fix the stack trace so it maps back
            // to your actual source code.
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });

    httpServer.listen(5174);

    ws.on('connection', socket => {
        console.log('connection detected');
        socket.emit("hello");
        // socket.on("reply", () => { console.log('true'); });
        // ws.emit("hello");
    });
}

createServer();
