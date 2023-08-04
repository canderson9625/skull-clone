enum cardSymbol {
    'skull' = 0,
    'flower'
}

enum cardArt {
    'skull' = 0,
    'flower',
    'skoal',
}

type Props = {
    symbol: cardSymbol,
    art: cardArt
}

export default function Card(props: Props) {
    props;
    return <div className="card">
        <div className="svg_wrapper">
            
        </div>
    </div>
}