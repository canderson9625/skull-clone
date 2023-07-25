// import React from 'react';
// import ReactDOM from 'react-dom/server';
// import App from './App.tsx';
// import './index.css';

// export default function entryServer() {
//     ReactDOM.renderToString(
//         <React.StrictMode>
//             {/* <Connection /> */}
//             <App />
//         </React.StrictMode>
//     )
// }

import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import './index.css';

export function render(url: string) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}