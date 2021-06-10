import { createContext, useContext, useEffect } from "react";
/* Aliases */
export const eventContext = createContext();
export const useEventContext = () => useContext(eventContext);

export class EventBroker {
    constructor() {
        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
    }
    stack = [];
    listeners = {
        __log_stack: [() => console.table(this.stack)]
    };

    emit(type, payload) {
        console.log(arguments);
        const event = { type, payload };
        this.stack.push(event);
        if (type in this.listeners) this.listeners[type].forEach(fn => fn({ type, payload, emit: this.emit }));
    }

    on(type, listener) {
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
    return <eventContext.Provider value={new EventBroker()}>{children}</eventContext.Provider>;
}

export function useEmit() {
    const broker = useEventContext();
    return broker.emit;
}

export function useOn(type, listener) {
    const broker = useEventContext();

    useEffect(function () {
        broker.on(type, listener);
    }, []);

    return null;
}