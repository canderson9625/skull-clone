import { useState, useEffect } from 'react';
// import Player from './player';
// import Card from './card';
// import  from  "socket.io-client"
import { io, Socket } from "socket.io-client";
import './index.css';
import './App.css';

interface ServerToClientEvents {
    hello: () => void;
}

interface ClientToServerEvents {
    hello: () => void;
    reply: () => void;
}

enum appState {
    'character' = 0,
    'card',
    'bet'
}

function App() {
    const [gamePhase, setGamePhase] = useState( appState.character );
    // const [activeBetter, setActiveBetter] = useState('');
    const buttons: JSX.Element[] = [];
    // const players: Player[] = Player;
    const colors = [
        'Red',
        'Green',
        'Blue',
        'Cyan',
        'Yellow',
        'Magenta'
    ]

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:5174');
    socket.on("connect", () => {
        console.log('client connected');
    });
    // socket.emit("reply");

    colors.forEach(val => {
        buttons.push(<button key={val} onClick={() => selectCharacter()}>{ val }</button>);
    });

    useEffect(()=>{
        // const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:5174')
        // socket.on('connect', ()=>console.log('connect'));
        // socket.on('connect_error', ()=>{
        //     setTimeout(()=>socket.connect(),1000)
        // })
        // socket.on('hello', ()=>console.log('hello'))
        // socket.on('disconnect',()=>console.log('server disconnected'))
        // socket.emit("reply");
    })

    /*
    main calls a connection component
    that socket calls this app
    the player needs to pick a color
    that color needs to be stored in the state of the app
    this property will be nested within the Player

    A Player needs state of 

    App's state is 

    Data structures
        (State_ Player holds an array of cards that get popped off the stack if they lose the bet
        Player's properties include color
        Bet is the value of the length of array which includes their cards automatically and fails if it detects a skull in the player stack during initialization.
        Bet makes a target size array that will add to the stack on click, if no skulls then flip that player's nameplate and enhance their cards with animations

    Turn 2 we don't need to really worry about changing state but
    we use enum so that we don't worry about the order just rather the functionality to be present in which mode

    we don't need to worry because we don't need to track the discarded cards unless we want to use them for something fun, functionally they are no longer necessary

    turn 2 would mean we need to take account for the person who joined 2nd to be the first person to select a card now
    so app needs to know what Player's turn to start the round

    but does app need to know the player names or id? can the interface be rendered separately from the card logic
    so we could read that state from the app from another interface component?

    or

    we could show the hex placeholders and show them fill up, then flip out as the user clicks on them
    each user sees the same thing happen at the same time

    */

    function selectCharacter() {
        // create the player in state with variables
        setGamePhase(appState.card);
        console.log(gamePhase);
    }

    // function selectCard() {

    // }

    // function selectBet() {

    // }

    return <> 
    { console.log()}
        { appState.character ? gamePhase : buttons }
        {/* { appState.card ? gamePhase : cards } */}
        {/* { appState.card ? gamePhase : bet } */}
        {/* { discard } */}
    </>;
}

export default App;
