// Message Queue Service — Async message queue for deferred processing.
// Replaces the message queue portion of the monolithic CommunicationService.
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface QueuedMessage {
  id: string;
  destination: string;
  timestamp: number;
  data: unknown;
  priority: number;
}

@Injectable({ providedIn: 'root' })
export class MessageQueueService {
  private readonly api = inject(ApiService);
  private readonly queue = signal<QueuedMessage[]>([]);

  readonly queue$ = this.queue.asReadonly();
  readonly queueLength = computed(() => this.queue().length);

  /** Enqueue a message for async processing. */
  async enqueue(destination: string, data: unknown, priority = 1): Promise<void> {
    const message: QueuedMessage = {
      id: this.generateId(),
      destination,
      timestamp: Date.now(),
      data,
      priority,
    };
    this.queue.update((q) => [...q, message]);
    await this.api
      .call('enqueueMessage', [destination, JSON.stringify(data), priority])
      .catch(() => {});
  }

  /** Dequeue and return the next message. */
  async dequeue<T>(): Promise<T | null> {
    const q = this.queue();
    if (q.length === 0) return null;
    const message = q[0];
    this.queue.update((arr) => arr.slice(1));
    return message.data as T;
  }

  /** Peek at the next message without removing it. */
  peek(): QueuedMessage | null {
    const q = this.queue();
    return q.length > 0 ? q[0] : null;
  }

  /** Clear the entire message queue. */
  clearQueue(): void {
    this.queue.set([]);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
