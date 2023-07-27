import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import * as io from 'socket.io';

const app = express();
const httpServer = http.createServer(app);
const ws = new io.Server(httpServer, { cors: { origin: 'localhost' } });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'custom',
    });

    app.use(vite.middlewares);

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

    httpServer.listen(5174);


    // leader key function idea, search file ignoring matches in comments

    let rooms = [];
    ws.on('connection', (socket) => {
        
        socket.emit('entry', socket.id);
        socket.on('set_player', (player, room) => {

            // check if room exists otherwise create room
            const foundRoom = rooms.findIndex(obj => obj.name === room); //n<100

            if ( foundRoom !== -1 ) { //room exists
                const foundPlayer = rooms[foundRoom].players.findIndex(obj => obj.name === player.name || obj.socket === player.socket ); // n<7 match on name okay because it's only within the specified room

                if (foundPlayer !== -1) {
                    rooms[foundRoom].players[foundPlayer] = Object.assign(rooms[foundRoom].players[foundPlayer], player);
                } else {
                    rooms[foundRoom].players.push(player);
                }

                // ws.emit('get_players', [...rooms[foundRoom].players].map());
            } else {
                rooms.push({
                    name: room,
                    players: [
                        player
                    ]
                })
            }
            
            // socket.join(room); probably not necessary considering how I'm handling this

            // ws.emit('get_players', [...rooms[foundRoom].players].map());
        });
        // socket.on('get_players', () => {
        //     socket.emit('get_players', [...players.values()]);
        // });

        // ws.to(activePlayer).emit('betVal');
        //  socket.on('betVal', () => {
            
        // })
    });
}

createServer();
