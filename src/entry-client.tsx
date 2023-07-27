// import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

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

