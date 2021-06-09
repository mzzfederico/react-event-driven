import { createContext, useCallback, useContext, useEffect, useState } from "react";
/* Aliases */
export const eventContext = createContext();
export const useEventContext = () => useContext(eventContext);

export class EventBroker {
    constructor() {
        this.emitEvent = this.emitEvent.bind(this);
        this.registerListener = this.registerListener.bind(this);
    }
    stack = [];
    listeners = {
        __log_stack: [() => console.table(this.stack)]
    };

    emitEvent(type, payload) {
        console.log(arguments);
        const event = { type, payload };
        this.stack.push(event);
        if (type in this.listeners) this.listeners[type].forEach(fn => fn({ type, payload, emit: this.emitEvent }));
    }

    registerListener(type, listener) {
        /* Sanity check */
        if (typeof type !== "string") return;
        if (typeof listener !== "function") return;
        /* Adds listener to existing array */
        if (Array.isArray(this.listeners[type])) return this.listeners[type].push(listener);
        /* Creates a new array if not present */
        return this.listeners[type] = [listener];
    }

    /* How to unmount listeners not needed anymore? */
}

export function EventProvider({ children }) {
    const brokerRef = useEventBroker();
    return <eventContext.Provider value={brokerRef}>{children}</eventContext.Provider>;
}

export function useEventBroker() {
    const [broker,] = useState(new EventBroker());
    return broker;
}


export function useListeners(...listeners) {
    const broker = useEventContext();

    useEffect(function () {
        listeners.forEach(([type, listener]) => broker.registerListener(type, listener));
    }, []);

    return null;
}

export function useEventEmitter() {
    const broker = useEventContext();
    return broker.emitEvent;
}