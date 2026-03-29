// Broadcast Service - One-to-many message broadcasting
import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface BroadcastMessage {
  event: string;
  data: unknown;
  timestamp: number;
  source: 'frontend' | 'backend';
}

export type BroadcastHandler = (data: BroadcastMessage) => void;

@Injectable({ providedIn: 'root' })
export class BroadcastService {
  private readonly api = inject(ApiService);

  private readonly handlers = new Set<BroadcastHandler>();
  private readonly broadcastCount = signal(0);
  private readonly lastMessage = signal<BroadcastMessage | null>(null);

  // Public readonly signals
  readonly broadcastCount$ = this.broadcastCount.asReadonly();
  readonly lastMessage$ = this.lastMessage.asReadonly();

  constructor() {
    this.setupBroadcastListeners();
  }

  /**
   * Broadcast a message to all clients
   */
  async broadcast(event: string, data: unknown): Promise<void> {
    this.broadcastCount.update(c => c + 1);
    await this.api.call('broadcast', [event, data]).catch(() => {});
  }

  /**
   * Listen for broadcast messages
   */
  onBroadcast(handler: BroadcastHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Get broadcast statistics
   */
  getStats(): { count: number; lastMessage: BroadcastMessage | null } {
    return {
      count: this.broadcastCount(),
      lastMessage: this.lastMessage(),
    };
  }

  /**
   * Reset broadcast statistics
   */
  resetStats(): void {
    this.broadcastCount.set(0);
    this.lastMessage.set(null);
  }

  private setupBroadcastListeners(): void {
    // Listen for broadcast messages from backend
    window.addEventListener('broadcast-message', ((event: CustomEvent) => {
      const { event: eventName, data } = event.detail;
      const message: BroadcastMessage = {
        event: eventName,
        data,
        timestamp: Date.now(),
        source: 'backend',
      };

      this.lastMessage.set(message);
      this.handlers.forEach(handler => handler(message));
    }) as EventListener);

    // Also listen for local broadcasts
    window.addEventListener('local-broadcast', ((event: CustomEvent) => {
      const message = event.detail as BroadcastMessage;
      this.lastMessage.set(message);
      this.handlers.forEach(handler => handler(message));
    }) as EventListener);
  }

  /**
   * Emit a local broadcast (frontend only)
   */
  broadcastLocal(event: string, data: unknown): void {
    const message: BroadcastMessage = {
      event,
      data,
      timestamp: Date.now(),
      source: 'frontend',
    };

    this.lastMessage.set(message);
    this.handlers.forEach(handler => handler(message));

    // Dispatch custom event for other listeners
    window.dispatchEvent(new CustomEvent('local-broadcast', { detail: message }));
  }
}
