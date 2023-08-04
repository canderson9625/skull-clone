import { Socket } from "socket.io-client";

interface IConnection {
    socket: Socket
}

export default function Connection({socket}: IConnection) {

    function startConnection() {
        const name = document.querySelector<HTMLInputElement>('#name')!.value;
        const room = document.querySelector<HTMLInputElement>('#roomName')!.value;
        if (
            name !== null &&
            room !== null
        ) {
            socket.emit('set_player', {id: 0, name: name}, room);
        } else {
            // Validation 
        }
    }

    return (<>
        <label htmlFor='name'>Enter your name</label>
        <input
            id='name'
            autoComplete='given-name'
        ></input>
        <label htmlFor='roomName'>Room name</label>
        <input
            id='roomName'
            autoComplete='nickname'
        ></input>
        <button
            type='submit'
            onClick={() => startConnection() }
        >
            Submit
        </button>
    </>)
}