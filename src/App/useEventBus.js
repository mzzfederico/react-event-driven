import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuid } from 'uuid';

/* Aliases */
export const eventContext = createContext();
export const useEventContext = () => useContext(eventContext);

export class EventBus {
    constructor() {
        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
    }
    stack = [];
    listeners = {
        __log_stack: [() => console.table(this.stack)]
    };

    emit(type, payload) {
        /* Sanity check */
        if (typeof type !== "string") return;

        const event = { type, payload };

        if (type in this.listeners) {
            Object.entries(this.listeners[type])
                .forEach(([id, listener]) => listener(
                    { type, payload, emit: this.emit, id }
                ));
            this.stack.push(event);
        }
    }

    on(type, listener) {
        /* Sanity check */
        if (typeof type !== "string") return;
        if (typeof listener !== "function") return;

        const id = uuid();

        this.listeners[type] = { [id]: listener, ...this.listeners[type] };

        /* Creates a new array if not present */
        return { type, id };
    }

    off(type, id) {
        /* Sanity check */
        if (typeof type !== "string") return;
        if (typeof id !== "string") return;

        if (type in this.listeners) {
            delete this.listeners[type][id];
        }
    }
}

const __init_bus = new EventBus();

export function EventProvider({ children }) {
    const [bus,] = useState(__init_bus);

    return <eventContext.Provider value={bus}>{children}</eventContext.Provider>;
}

export function useEmit() {
    const bus = useEventContext();

    return bus.emit;
}

export function useOn(type, listener) {
    const bus = useEventContext();

    useEffect(() => {
        const { id } = bus.on(type, listener);
        return () => {
            bus.off(type, id);
        }
    }, [type, bus, listener]);
}