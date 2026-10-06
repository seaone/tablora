import { APP_CONFIG } from "@/shared/config";
import { SSE_EVENTS } from "@tablora/shared";
import type { FullTableData } from "./table";

const RECONNECT_DELAY_MS = 3000;

export interface TableSubscriptionHandlers {
  onSnapshot: (table: FullTableData) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function tableEventsUrl(tableId: string): string {
  return `${APP_CONFIG.apiUrl}/api/tables/${tableId}/events`;
}

/**
 * Subscribes to a table's live updates over SSE with auto-reconnect.
 * Returns an unsubscribe function that closes the stream and clears timers.
 */
export function subscribeToTable(tableId: string, handlers: TableSubscriptionHandlers): () => void {
  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  function connect() {
    if (closed) return;

    const es = new EventSource(tableEventsUrl(tableId));
    eventSource = es;

    es.addEventListener(SSE_EVENTS.connected, () => {
      if (closed) return;
      handlers.onConnected?.();
    });

    es.addEventListener(SSE_EVENTS.tableSnapshot, (event) => {
      if (closed) return;
      try {
        handlers.onSnapshot(JSON.parse(event.data));
      } catch (err) {
        console.error("Error parsing snapshot:", err);
      }
    });

    es.addEventListener(SSE_EVENTS.tableUpdated, (event) => {
      if (closed) return;
      try {
        handlers.onSnapshot(JSON.parse(event.data));
      } catch (err) {
        console.error("Error parsing update:", err);
      }
    });

    es.onerror = () => {
      if (closed) return;
      handlers.onDisconnected?.();
      es.close();

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    };
  }

  connect();

  return () => {
    closed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    eventSource?.close();
  };
}
