import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import vitePluginSocketIO from 'vite-plugin-socket-io'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] //, vitePluginSocketIO()]
  // server: {
  //   origin: 'http://127.0.0.1:8080',
  //   proxy: {
  //     '/socket.io': {
  //       target: 'ws://localhost:5174',
  //       ws: true
  //     }
  //   }
  // }
})
