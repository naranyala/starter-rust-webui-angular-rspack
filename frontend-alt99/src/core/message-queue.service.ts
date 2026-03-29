// Message Queue Service - Handles async message queuing
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Message {
  id: string;
  channel: 'message-queue';
  type: 'request' | 'response' | 'event';
  source: 'frontend' | 'backend';
  destination: string;
  timestamp: number;
  data: unknown;
  priority: number;
}

@Injectable({ providedIn: 'root' })
export class MessageQueueService {
  private readonly api = inject(ApiService);

  private readonly queue = signal<Message[]>([]);

  // Public readonly signals
  readonly queue$ = this.queue.asReadonly();
  readonly queueLength = computed(() => this.queue().length);
  readonly isEmpty = computed(() => this.queue().length === 0);
  readonly hasMessages = computed(() => this.queue().length > 0);

  /**
   * Enqueue a message for async processing
   */
  async enqueue(destination: string, data: unknown, priority: number = 1): Promise<void> {
    const message: Message = {
      id: this.generateId(),
      channel: 'message-queue',
      type: 'request',
      source: 'frontend',
      destination,
      timestamp: Date.now(),
      data,
      priority,
    };

    this.queue.update(q => [...q, message]);

    // Send to backend queue
    await this.api.call('enqueueMessage', [destination, JSON.stringify(data), priority]).catch(() => {});
  }

  /**
   * Dequeue and process next message
   */
  async dequeue<T>(): Promise<T | null> {
    const q = this.queue();
    if (q.length === 0) {
      return null;
    }

    const message = q[0];
    this.queue.update(queue => queue.slice(1));

    return message.data as T;
  }

  /**
   * Peek at next message without removing
   */
  peek(): Message | null {
    const q = this.queue();
    return q.length > 0 ? q[0] : null;
  }

  /**
   * Clear message queue
   */
  clearQueue(): void {
    this.queue.set([]);
  }

  /**
   * Get all messages in queue
   */
  getAllMessages(): Message[] {
    return [...this.queue()];
  }

  /**
   * Get messages by destination
   */
  getByDestination(destination: string): Message[] {
    return this.queue().filter(m => m.destination === destination);
  }

  /**
   * Get high priority messages (priority >= 5)
   */
  getHighPriorityMessages(): Message[] {
    return this.queue().filter(m => m.priority >= 5);
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
