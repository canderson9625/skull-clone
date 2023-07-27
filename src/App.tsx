import { useEffect, useState } from 'react';
// import Player from './player';
// import Card from './card';
import { io } from 'socket.io-client';
import './index.css';
import './App.css';

enum appState {
    'ws_connect' = 0,
    'character',
    'card',
    'bet',
}

// I'm thinking all the room connection and player settings will be it's own component
interface Player {
    name: string,
    socket: string,
    color: string,
    symbolFlower: string,
    symbolSkull: string,
    bet: number,
    active: boolean
}

const defaults: Player = {
    name: '',
    socket: '',
    color: '',
    symbolFlower: '',
    symbolSkull: '',
    bet: 0,
    active: false
}

// the cards will be held by the app and dealt to players
// re-rendering what is in their hands socket specific, the game holds their hands and enforces their input rather than relying on the player to send back what hand they want
// re-rendering global ui info that is a shared state between all players, like player name, room code, color and art symbols 


function App() {
    const [gamePhase, setGamePhase] = useState(appState.ws_connect);
    const [gameSocket, setGameSocket] = useState('');
    const [socket] = useState(io());
    const [name, setName] = useState('');
    // const [card, setCard] = useState('');
    // const [bet, setBet] = useState(0);
    const [room, setRoom] = useState('');
    const [player, setPlayer] = useState<Player>(defaults);
    const [players, setPlayers] = useState([name]);
    const buttons: React.JSX.Element[] = [];

    // calls startConnection with params name, room
    const connection: React.JSX.Element = (
        <>
            <label htmlFor='name'>Enter your name</label>
            <input
                id='name'
                autoComplete='given-name'
                defaultValue={name}
            ></input>
            <label htmlFor='roomName'>Room name</label>
            <input
                id='roomName'
                autoComplete='nickname'
                defaultValue={room}
            ></input>
            <button
                type='submit'
                onClick={() => startConnection(
                    window.sessionStorage.getItem('name') || document.querySelector<HTMLInputElement>('#name')!.value,
                    window.sessionStorage.getItem('room') || document.querySelector<HTMLInputElement>('#roomName')!.value
                )}
            >
                Submit
            </button>
        </>
    );

    // calls selectCard with param cardSymbol
    // const cards: React.JSX.Element = (
    //     <>
    //         <button onClick={() => selectCard('flower')}>Flower</button>
    //         <button onClick={() => selectCard('skull')}>Skull</button>
    //     </>
    // );

    // calls selectBet with param betVal
    // const betting: React.JSX.Element = (
    //     <>
    //         <input
    //             type='range'
    //             id='bet'
    //         ></input>
    //         <button
    //             onClick={() =>
    //                 selectBet(
    //                     document.querySelector<HTMLInputElement>('#bet')!.value
    //                 )
    //             }
    //         >
    //             Submit Bet
    //         </button>
    //     </>
    // );

    // fills buttons array with various colored buttons
    // we'll have two more for skull icons and flower icons that we'll also push to the buttons array
    const colors = ['Red', 'Green', 'Blue', 'Cyan', 'Yellow', 'Magenta'];
    colors.forEach((val) => {
        buttons.push(
            <button
                key={val}
                onClick={() => selectCharacter(val)}
            >
                {val}
            </button>
        );
    });

    function startConnection(name: string, room: string) {
        if (name === '' || room === '') return;
        setName(window.sessionStorage.getItem('name') || name);
        window.sessionStorage.setItem('name', window.sessionStorage.getItem('name') || name);
        setRoom(window.sessionStorage.getItem('room') || room);
        window.sessionStorage.setItem('room', window.sessionStorage.getItem('room') || room);
        window.sessionStorage.setItem('gameSocket', window.sessionStorage.getItem('gameSocket') || socket.id);
        const player: Player = {
            name: name,
            socket: socket.id,
            color: 'red',
            symbolFlower: 'flower', // we'll be loading in different svg assets down the line but functionality should remain the same
            symbolSkull: 'skull',
            bet: 0, // 0 is pass
            active: false
        }
        setPlayer(player);
        setPlayers([name])
        socket.emit('set_player', player);
    }

    // select color, flower, and skull then emit
    function selectCharacter(color: string) {
        // create the player in state with variables
        const playerObj: Player = {
            name: name,
            socket: socket.id,
            color: color,
            symbolFlower: '',
            symbolSkull: '',
            bet: 0,
            active: false
        }

        // maybe I will need to do this later on for some reason?
        // const result = Object.assign(player, playerObj)
        setPlayer(playerObj);
        socket.emit('set_player', playerObj, room);
        setGamePhase(appState.card);
    }

    // function selectCard(cardSymbol: string) {
    //     setCard(cardSymbol);
    //     console.log(card);
    //     socket.emit('card', card);
    // }

    // function selectBet(betVal: string) {
    //     setBet(parseInt(betVal));
    //     socket.emit('bet', bet);
    // }

    useEffect(() => {
        socket.on('entry', (data) => {
            //reconnect on refresh or connection loss within same tab
            if ( window.sessionStorage.getItem('gameSocket') !== null && window.sessionStorage.getItem('name') !== null && window.sessionStorage.getItem('room') !== null ) {
                // console.log(window.sessionStorage.getItem);
                setGameSocket(window.sessionStorage.getItem('gameSocket')!);
                setName(window.sessionStorage.getItem('name')!);
                setPlayers([window.sessionStorage.getItem('name')!])
                setRoom(window.sessionStorage.getItem('room')!);
                const player: Player = {
                    name: window.sessionStorage.getItem('name')!,
                    socket: window.sessionStorage.getItem('gameSocket')!,
                    color: 'red',
                    symbolFlower: 'flower', // we'll be loading in different svg assets down the line but functionality should remain the same
                    symbolSkull: 'skull',
                    bet: 0, // 0 is pass
                    active: false
                }
                setPlayer(player);
                socket.emit('set_player', player, window.sessionStorage.getItem('room')!);
                // console.log(player, room);
                setGamePhase(appState.character);
            } else {
                // new connection
                setGameSocket(data);
            }
        });
        socket.on('get_players', (players) => {
            setPlayers(players);
        });
        // socket.on('card', (data) => {
        //     data
        // });
    }, [socket, gameSocket, room]);

    return (
        <>
            <div id="ui">
                <div id="room">{room}</div>
                <div id='players'>{players.map(s => s + '\n')}</div>
                <div className="you">{[...Object.entries(player)].map(s => s + '\n')}</div>
            </div>

            {/* check enum against gamePhase since we won't have to call gamePhase again */}
            {appState.ws_connect === gamePhase ? connection : null}
            {appState.character === gamePhase ? buttons : null}
            {/* {appState.card === gamePhase ? cards : <></>} */}
            {/* {appState.bet === gamePhase ? betting : <></>} */}
            {/* { appState.card ? gamePhase : cards } */}
            {/* { appState.card ? gamePhase : bet } */}
            {/* { discard } */}
        </>
    );
}

export default App;
