// import { Socket } from "socket.io-client";

export default function gameServer(ws) {
    const rooms = [];

    // leader key function idea, search file ignoring matches in comments
    // I imagine the number of concurrent rooms will be less than 10 at any given time
    // as the number of rooms increase we would want to rethink just an array of room objects

    ws.on('connection', (socket) => {
        socket.on('set_player', (playerObj, room) => {
            const [foundRoom, foundPlayer] = addUpdatePlayer(playerObj, room);
            // console.log(rooms);

            socket.join(rooms[foundRoom].name);
            socket.emit(
                'get_player',
                foundPlayer,
                foundRoom,
                rooms[foundRoom]
            );
            ws.to(rooms[foundRoom].name).emit(
                'all_players',
                rooms[foundRoom].players
            );
        });

        // connection loss and reconnection will update player list
        socket.on('reconnect', (playerID, roomID) => {
            const foundPlayer = rooms[roomID]?.players[playerID];

            if (typeof(foundPlayer) !== 'undefined') {
                socket.emit('get_player', playerID, roomID, rooms[roomID]);
            } else {
                socket.emit('get_player', -1);
            }
        })

        socket.on('all_players', (roomID) => {
            if (roomID > -1) {
                ws.to(roomID).emit('all_players', rooms[roomID].players);
            }
        });

        // each player sends their card to the stack 'Readying up' skip an unnecessary ready screen
        socket.on('push_card', (roomID) => {
            // when each player's stack has 1 card
            // then emit to the active player to start
            // and do this down the line until some one bets
            ws.to(rooms[roomID].name).emit('');
        });

        // each player in order bets or passes
        socket.on('bet', (room) => {
            ws.to(room);
        });

        // the ws starts emitting information about resolution
        // and preps for the next round
        // marking a seat as a spectator which won't be reset until a new room is issued and this one is destroyed
        // socket.to(rooms[i]).emit('game_end', () => {
        //     rooms[i];
        // });

        // ws.to(activePlayer).emit('betVal');
        //  socket.on('betVal', () => {

        // })
    });

    function searchRooms(roomID) {
        // console.log(roomID, rooms[roomID], rooms, rooms.map(r => r?.id + ': ' + r?.name), rooms.findIndex((r) => r.name === roomID));
        return rooms[roomID] !== undefined
            ? roomID
            : rooms.findIndex(roomObj => roomObj.name === roomID); //n<100
        // we could improve the search for the index using binary search
    }

    function searchPlayers(playerID, roomID) {
        // searchRooms should have already been used to determine the correct index
        // console.log(rooms[roomID]?.players.findIndex(p => p.id === playerID), rooms[roomID]?.players.findIndex(p => p.name === playerID));
        console.log(rooms[roomID]?.players);
        return (
            rooms[roomID]?.players.findIndex(
                (obj) =>
                    obj.id === playerID ||
                    obj.name === playerID
            )
        );
    }

    function addUpdatePlayer(playerObj, room) {
        let foundRoom = searchRooms(room);
        let foundPlayer = searchPlayers(playerObj.id || playerObj.name, foundRoom);

        if (foundRoom > -1 && foundPlayer > -1) {
            // console.log('update player');
            // update player in room
            Object.assign(
                rooms[foundRoom].players[foundPlayer],
                playerObj
            );
        } else if (foundRoom > -1) {
            // console.log('add player');
            // foundPlayer = insertGetIndex(rooms[foundRoom].players, playerObj);
            const size = rooms[foundRoom].players.length;
            playerObj = Object.assign(playerObj, {id: size});
            rooms[foundRoom].players.push(playerObj);
            foundPlayer = size;
            // we store the player as id 0 on add, but we need to update their id
        } else {
            // console.log('create room');
            // create room then push player
            foundRoom = insertGetIndex(rooms, {
                id: parseInt(rooms.length),
                name: room,
                players: [playerObj],
            });
            foundPlayer = 0;
        }

        return [foundRoom, foundPlayer];
    }

    function insertGetIndex(arr, any) {
        const size = arr.length;
        arr.push(any);
        return parseInt(size);
    }
}
