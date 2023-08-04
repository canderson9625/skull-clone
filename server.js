import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import * as io from 'socket.io';
import gameServer from './src/appGameServer.js';

const app = express();
const httpServer = http.createServer(app);
const ws = new io.Server(httpServer, { cors: { origin: 'localhost' } });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;

async function createServer(port) {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
    });

    app.use(vite.middlewares);

    // Pre-render
    app.use('*', async (req, res, next) => {
        const url = req.originalUrl;

        try {
            let template = fs.readFileSync(
                path.resolve(__dirname, 'index.html'),
                'utf-8'
            );
            template = await vite.transformIndexHtml(url, template);
            const { render } = await vite.ssrLoadModule(
                '/src/entry-server.tsx'
            );
            const appHtml = await render(url);
            const html = template.replace(`<!--ssr-outlet-->`, appHtml);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });

    httpServer.listen(port);

    gameServer(ws);
}

createServer(port);
