import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
// import { render } from 'react-dom';

// function startConnection() {
//     // holds the players in the sockets
//     // connection instantiates the player with properties based on availability and selection
//     // will be grayed out but maybe there could be an instance of a race connection thingy

//     // can we refresh and reconnect to the port but only if there is a storage token or something?
// }
    
// startConnection();

// import io from "socket.io-client";
// const socket = io('http://127.0.0.1:5174')
// socket.on("connect", () => {
//     console.log('entry');
// });
// socket.on("hello", () => {
//     console.log('test');
// })
// console.log(socket);

// Dev
ReactDOM.hydrateRoot(document.getElementById("root")!,
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

// // Strict Mode - Dev testing
// ReactDOM.hydrateRoot(document.getElementById("root")!,
//     <React.StrictMode>
//         <BrowserRouter>
//             {/* <Connection /> */}
//             <App />
//         </BrowserRouter>
//     </React.StrictMode>
// );

