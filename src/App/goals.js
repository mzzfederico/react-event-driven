import { useState } from "react";
import { EventProvider, useOn, useEmit } from "./useEventBus";

export default function App() {
    return (
        <EventProvider>
            <div className="pa2">
                <Goal squadra={"A"} />
                <ComponenteB squadra={"A"} />
            </div>
            <div className="pa2">
                <Goal squadra={"B"} />
                <ComponenteB squadra={"B"} />
            </div>
        </EventProvider>
    );
}

export function Goal({ squadra }) {
    const [punteggio, setPunteggio] = useState(0);

    useOn(`goal squadra ${squadra}`, () => setPunteggio(p => p + 1));

    return (
        <em className="mr3">Punteggio squadra {squadra}: {punteggio}</em>
    )
}

export function ComponenteB({ squadra }) {
    const emit = useEmit();

    return (
        <button onClick={e => emit(`goal squadra ${squadra}`)}>Fai goal</button>
    )
}

export function ComponenteC() {
    const emit = useEmit();

    return (
        <button onClick={e => emit(`__log_stack`)}>Log</button>
    )
}
