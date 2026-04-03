// Event Bus Service — Pub/Sub event channel
// Replaces the event bus portion of the monolithic CommunicationService.
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export type EventHandler = (data: unknown, event: string) => void;

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly api = inject(ApiService);
  private readonly handlers = new Map<string, Set<EventHandler>>();
  readonly activeSubscriptions = computed(() => {
    let count = 0;
    this.handlers.forEach((h) => (count += h.size));
    return count;
  });

  /** Subscribe to an event name. Returns an unsubscribe function. */
  subscribe(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /** Publish an event to the backend. */
  async publish(event: string, data: unknown): Promise<void> {
    await this.api.call('publishEvent', [event, data]).catch(() => {});
  }

  /** Emit a local event and notify the backend. */
  emit(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((h) => h(data, event));
    }
    this.publish(event, data).catch(() => {});
  }

  /** Invoke all local handlers for an event (no backend notification). */
  emitLocal(event: string, data: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((h) => h(data, event));
    }
  }
}
