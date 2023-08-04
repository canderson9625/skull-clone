import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

ReactDOM.hydrateRoot(document.getElementById("root")!,
    <React.StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </React.StrictMode>
);

// Dev testing
// ReactDOM.hydrateRoot(document.getElementById("root")!,
//     <BrowserRouter>
//         <App />
//     </BrowserRouter>
// );