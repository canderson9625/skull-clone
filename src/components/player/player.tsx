import { appState } from '../../utils/common';

export interface IPlayer {
    id?: number;
    name?: string;
    socket?: string;
    room?: number;
    color?: string;
    symbolFlower?: string;
    symbolSkull?: string;
    bet?: number;
    active?: boolean;
    held?: string[];
    stack?: string[];
}

interface gameInterface {
    gamePhase: appState;
    colors?: string[];
    cards?: string[];
    maxBet?: number;
    bet?: number;
    selectCharacter?: (color: string, flower?: string, skull?: string) => void;
    selectCard?: (card: string, discard?: number) => void;
    selectBet?: () => void;
}

export default function Player({
    gamePhase,
    colors,
    cards,
    selectCharacter,
    selectCard,
    selectBet,
}: gameInterface) {
    
    // this will be a higher order component that will contextually render what the user needs to see based on the passed props from app state
    // we could init colors and cards instead of asserting with !
    const buttons: JSX.Element[] = [];

    switch (gamePhase) {
        case appState['Select Character']: {
            colors!.forEach((val: string, idx) => {
                buttons.push(
                    <button
                        key={'colors_' + idx}
                        onClick={() => selectCharacter!(val)}
                    >
                        {val}
                    </button>
                );
            });
            break;
        }
        case appState['Place A Card']: {
            cards!.forEach((val: string, idx) => {
                buttons.push(
                    <button
                        key={'cards_' + idx}
                        onClick={() => selectCard!(val)}
                    >
                        {val}
                    </button>
                );
            });
            // consider reducer instead of forEach
            break;
        }
        case appState.Results: {
            cards!.forEach((val: string, idx) => {
                buttons.push(
                    <button
                        key={'discard_' + idx}
                        onClick={() => selectCard!(val, 1)}
                    >
                        {val}
                    </button>
                );
            });
            break;
        }
        default: {
            buttons.push(
                <>
                    <input
                        key={0}
                        type='number'
                        min={0}
                        max={23}
                    />
                    <button
                        key={1}
                        onClick={() => selectBet!()}
                    >
                        Submit
                    </button>
                </>
            );
        }
    }

    return (
        <div className='player'>
            <div className='game_phase'>{appState[gamePhase]}</div>
            <div className='interface'>
                {/* <button></button> various buttons will show here depending on the game phase */}
                {buttons !== null ? buttons : null}
            </div>
        </div>
    );
}
