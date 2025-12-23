/**
 * Mirage Bridge - EventSource Polyfill
 *
 * Provides a Virtual SSE implementation that routes through the Bridge.
 */

import { interceptedFetch } from './fetch';

/**
 * MirageEventSource - A polyfill for EventSource that works via the Bridge.
 * 
 * Apps can use `new EventSource('/mirage/v1/feed')` and it will be
 * transparently routed through the virtual API.
 */
export class MirageEventSource extends EventTarget {
    readyState = 0; // CONNECTING
    url: string;
    withCredentials = false;

    // Standard EventSource constants
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSED = 2;

    private _controller: AbortController;

    constructor(url: string, eventSourceInitDict?: EventSourceInit) {
        super();
        this.url = url;
        this.withCredentials = eventSourceInitDict?.withCredentials ?? false;
        this._controller = new AbortController();

        setTimeout(() => this.connect(), 0);
    }

    private async connect() {
        try {
            const response = await interceptedFetch(this.url, {
                headers: { 'Accept': 'text/event-stream' },
                signal: this._controller.signal
            });

            if (!response.ok) {
                this.close();
                this.dispatchEvent(new Event('error'));
                return;
            }

            this.readyState = 1; // OPEN
            this.dispatchEvent(new Event('open'));

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No body in response');

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                this.processChunk(chunk);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                this.dispatchEvent(new Event('error'));
            }
            this.close();
        }
    }

    private processChunk(chunk: string) {
        // Simple SSE parser: looks for "data: json\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                const event = new MessageEvent('message', { data });
                this.dispatchEvent(event);
                if (this.onmessage) this.onmessage(event);
            }
        }
    }

    close() {
        this.readyState = 2; // CLOSED
        this._controller.abort();
    }

    onopen: ((this: MirageEventSource, ev: Event) => any) | null = null;
    onmessage: ((this: MirageEventSource, ev: MessageEvent) => any) | null = null;
    onerror: ((this: MirageEventSource, ev: Event) => any) | null = null;
}
