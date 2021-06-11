import { useEffect, useState } from "react";
import { EventProvider, useOn, useEmit } from "./useEventBus";

export default function App() {
    const [showLog, setShowLog] = useState(false);

    return (
        <EventProvider>
            <BlogPost />
            <hr />
            <Pagination />
            <hr />

            <button onClick={() => setShowLog(p => !p)}>mostra log</button>
            {showLog && <History />}
        </EventProvider>
    );
}

export function BlogPost({ number = 1 }) {
    const emit = useEmit();
    /* const seconds = useAutomatedPagination({ length: 5 }); */

    const [pageNum, setPageNum] = useState(number);
    const [content, setContent] = useState(null);

    useOn('post/init', ({ emit, payload = 1 }) => fetch('https://jsonplaceholder.typicode.com/posts/' + payload)
        .then(response => response.json())
        .then(json => emit('post/done', json))
        .catch(error => emit('post/error', error))
    );
    useOn('post/done', ({ payload }) => setContent(payload));
    useOn('post/error', ({ payload }) => console.error(payload));
    useOn('post/changePage', ({ payload }) => setPageNum(payload));

    useEffect(() => {
        emit('post/init', pageNum);
    }, [emit, pageNum]);

    return content && <div className="pa2">
        <h1>{content.title}</h1>
        <h2>{content.body}</h2>
    </div>;

}

export function Pagination() {
    const emit = useEmit();

    const [page, setPage] = useState(1);

    const next = () => setPage(p => p + 1);
    const previous = () => setPage(p => p > 0 ? p - 1 : 0);

    useOn('post/next', () => next());

    useEffect(() => {
        emit('post/changePage', page);
    }, [emit, page]);

    return <div className="pa2">
        <button onClick={previous}>Prima</button>
        <p>{page}</p>
        <button onClick={next}>Dopo</button>
    </div>
}

export function useAutomatedPagination({ length = 5 }) {
    const emit = useEmit();
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSeconds(t => t + 1);
        }, 1000);

        return () => clearTimeout(timer);
    });

    useEffect(() => {
        if (seconds === length) {
            emit('post/next');
            setSeconds(0);
        }
    }, [length, seconds, setSeconds, emit]);

    return seconds;
}

export function History() {
    const [log, setLog] = useState([]);
    const addVisitedPost = (title) => setLog(p => [...p, title]);

    useOn('post/done', ({ payload: { title } }) => addVisitedPost(title))

    return (
        <ul>{log.map((postTitle, index) => <li key={index}>{postTitle}</li>)}</ul>
    )
}

