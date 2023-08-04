import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Player, { IPlayer } from './components/player/player';
import Connection from './components/connection/connection'
import { appState } from './utils/common';
import './App.css';

interface IRoom {
    id: number,
    name: string,
    players: IPlayer[]
}

const RoomDefaults: IRoom = {
    id: -1,
    name: 'no room',
    players: [
        {name: ''}
    ]
}

const PlayerDefaults: IPlayer = {
    id: -1,
    name: '',
    room: -1,
    color: '',
    symbolFlower: 'flower',
    symbolSkull: 'skull',
    bet: 0,
    active: false,
    held: ['flower', 'flower', 'flower', 'skull'],
    stack: []
}

let i = 0;
function App() {
    const [gamePhase, setGamePhase] = useState(appState['Connect to Room']);
    const [room, setRoom] = useState<IRoom>(RoomDefaults);
    const [player, setPlayer] = useState<IPlayer>(PlayerDefaults);
    const socket = io();

    // select color, flower, and skull then emit
    function selectCharacter(color: string) {
        // create the player in state with variables
        const playerObj: IPlayer = {
            id: player.id,
            name: player.name,
            room: player.room,
            color: color,
            symbolFlower: player.symbolFlower,
            symbolSkull: player.symbolSkull,
        }

        setPlayer((current) => Object.assign({...current}, playerObj));
        setGamePhase(appState['Place A Card']);
        socket.emit('set_player', playerObj, room.id);
    }

    // handle the selection of card for discard and other phases
    function selectCard(cardSymbol: string, discard?: number) {
        const playerObj = player;
        const card = cardSymbol === 'flower' ? playerObj.held!.shift() : playerObj.held!.pop();
        if (discard === undefined) {
            playerObj.stack!.push(card!);
        }

        setPlayer((player) => {
            return Object.assign(player, playerObj);
        })

        if (discard === undefined) {
            setGamePhase(appState['Bet or Pass']);
            socket.emit('card', player.id, room.id, playerObj);
        } else {
            setGamePhase(appState['Place A Card']);
            socket.emit('discard', playerObj);
        }
    }

    // handle the increase or pass of bet
    function selectBet(betVal?: number) {
        // if (betVal === undefined) {
        //     betVal = parseInt(document.querySelector<HTMLInputElement>('#bet')!.value);
        // }
        // setGamePhase(appState.result);
        socket.emit('bet', betVal);
    }

    // calculate available colors which also will reject players if there are no available slots
    // const selectedColors = [];
    const availableColors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta'];
    function reduceColors() {
        room?.players.forEach((player) => {
            if ( availableColors.includes(player?.color || '') ) {
                // selectedColors.push(player.color); // not sure if we will need this
                for (let i = 0; i < availableColors.length; i++) {
                    if (availableColors[i] === player.color) {
                        availableColors.splice(i, 1);
                        return;
                    }
                }
            }
        });
    }
    reduceColors();
    // releaseColors to put previously selected colors back into availability


    // update player and room state
    socket.on('get_player', (playerID, roomID, roomObj) => {
        // if our room isn't found reset our cached variables
        if (playerID === -1) {
            window.sessionStorage.setItem('roomID', '');
            window.sessionStorage.setItem('playerID', '');
            return;
        }

        //Update room and player state
        playerID = parseInt(playerID);
        roomID = parseInt(roomID);
        window.sessionStorage.setItem('roomID', roomID);
        window.sessionStorage.setItem('playerID', playerID);
        setRoom((current) => {
            return Object.assign({...current} || RoomDefaults, roomObj);
        });
        setPlayer((current) => {
            // we need to pass back the player index so that if they are joining a room they know which seat they were given
            return Object.assign({...current} || PlayerDefaults, roomObj.players[playerID], {id: playerID, room: roomID});
        });


        // which game phase do we need to go to?
        if (
            roomObj.players[playerID].color !== undefined &&
            roomObj.players[playerID].symbolFlower !== undefined &&
            roomObj.players[playerID].symbolSkull !== undefined
        ) {
            setGamePhase(appState['Place A Card']);
        } else if (gamePhase === appState['Connect to Room']) {
            setGamePhase(appState['Select Character']);
        } //else if (
            // condition for going to betting phase, results ...
        //)
    });   
    
    socket.on('all_players', players => {
        setRoom(current => {
            return Object.assign({...current}, {players});
        });
    });

    // Connect on refresh
    useEffect(() => {
        const cachedPlayer = window.sessionStorage.getItem('playerID');
        const cachedRoom = window.sessionStorage.getItem('roomID');

        if (
            cachedPlayer !== null &&
            i < 1 && // not more than once
            cachedRoom !== null 
        ) {
            socket.emit('reconnect', cachedPlayer, cachedRoom);
            i++;
        }

        return () => {
            console.log('disconnect called');
        }
    });

    return (
        <>
            <div id='ui'>
                <div id='room'>{room.name !== null ? 'Game Room: ' + room.name : null}</div>
                <div id='players'>{room.players.map((player, idx) => idx + ': ' + player.name + '\n' )}</div>
                <div className="you">{[...Object.entries(player)].map(s => s + '\n')}</div>
            </div>

            {/* use yoda condition here, keep constants on the left and variables on the right*/}
            {appState['Connect to Room'] === gamePhase ? <Connection socket={socket}/> : null}

            {appState['Select Character'] === gamePhase ? 
                <Player 
                    gamePhase={appState['Select Character']}
                    colors={availableColors}
                    selectCharacter={selectCharacter}
                /> : null
            }

            {appState['Place A Card'] === gamePhase ?
                <Player
                    gamePhase={appState['Place A Card']}
                    cards={player.held}
                    selectCard={selectCard}
                /> : null
            }

            {appState['Bet or Pass'] === gamePhase ? 
                <Player
                    gamePhase={appState['Bet or Pass']}
                    selectBet={selectBet}
                    maxBet={23}
                /> : null
            }
        </>
    );
}

export default App;
