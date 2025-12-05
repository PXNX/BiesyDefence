type Handler<T> = (payload: T) => void;

/**
 * Lightweight, dependency-free event bus to decouple UI ↔ game systems.
 */
export class EventBus<TEvents extends Record<string, any>> {
  private listeners = new Map<
    keyof TEvents,
    Set<Handler<TEvents[keyof TEvents]>>
  >();

  on<K extends keyof TEvents>(
    event: K,
    handler: Handler<TEvents[K]>
  ): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(handler as Handler<TEvents[keyof TEvents]>);
    this.listeners.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends keyof TEvents>(event: K, handler: Handler<TEvents[K]>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler as Handler<TEvents[keyof TEvents]>);
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return;
    set.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`EventBus handler for "${String(event)}" failed`, error);
      }
    });
  }
}
