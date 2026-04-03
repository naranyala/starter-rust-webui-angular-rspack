// Communication Service — Facade over focused services.
// Maintains backward compatibility while delegating to specialized services:
//   - ApiService (WebUI Bridge / RPC)
//   - EventBusService (Pub/Sub)
//   - SharedStateService (Reactive key-value state)
//   - MessageQueueService (Async queue)
import { Injectable, signal, computed, inject } from '@angular/core';
import { ApiService } from './api.service';
import { EventBusService } from './event-bus.service';
import { SharedStateService, SharedState } from './shared-state.service';
import { MessageQueueService } from './message-queue.service';

export type MessageChannel =
  | 'webui-bridge'
  | 'event-bus'
  | 'shared-state'
  | 'message-queue'
  | 'broadcast';
export type MessageType =
  | 'request'
  | 'response'
  | 'event'
  | 'broadcast'
  | 'state-update'
  | 'ack';
export type EventHandler = (data: unknown, event: string) => void;
export type StateChangeHandler = (key: string, value: unknown) => void;

export interface CommunicationStats {
  totalMessages: number;
  messagesByChannel: Record<string, number>;
  messagesByType: Record<string, number>;
  queueLength: number;
  broadcastCount: number;
  activeSubscriptions: number;
  stateVersion: number;
  lastActivity: number;
}

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly api = inject(ApiService);
  private readonly eventBus = inject(EventBusService);
  private readonly sharedState = inject(SharedStateService);
  private readonly messageQueue = inject(MessageQueueService);

  private readonly _stats = signal<CommunicationStats>({
    totalMessages: 0,
    messagesByChannel: {},
    messagesByType: {},
    queueLength: 0,
    broadcastCount: 0,
    activeSubscriptions: 0,
    stateVersion: 0,
    lastActivity: Date.now(),
  });

  readonly stats$ = this._stats.asReadonly();
  readonly queue$ = this.messageQueue.queue$;
  readonly queueLength = this.messageQueue.queueLength;
  readonly isConnected = signal(true);

  // ==========================================================================
  // WebUI Bridge (RPC)
  // ==========================================================================

  async call<T>(functionName: string, args: unknown[] = []): Promise<T> {
    this.incrementStats('webui-bridge', 'request');
    return this.api.callOrThrow<T>(functionName, args);
  }

  async callWithResponse<T>(
    functionName: string,
    args: unknown[] = [],
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const responseEvent = `${functionName}_response`;
      const handler = (event: CustomEvent<T>) => {
        window.removeEventListener(responseEvent, handler as EventListener);
        this.incrementStats('webui-bridge', 'response');
        resolve(event.detail);
      };
      window.addEventListener(responseEvent, handler as EventListener);
      this.call(functionName, args).catch(reject);
      setTimeout(() => {
        window.removeEventListener(responseEvent, handler as EventListener);
        reject(new Error(`Timeout waiting for response: ${functionName}`));
      }, 30000);
    });
  }

  // ==========================================================================
  // Event Bus (Pub/Sub) — delegated
  // ==========================================================================

  subscribe(event: string, handler: EventHandler): () => void {
    return this.eventBus.subscribe(event, handler);
  }

  async publish(event: string, data: unknown): Promise<void> {
    this.incrementStats('event-bus', 'event');
    return this.eventBus.publish(event, data);
  }

  emit(event: string, data: unknown): void {
    this.incrementStats('event-bus', 'event');
    this.eventBus.emit(event, data);
  }

  // ==========================================================================
  // Shared State — delegated
  // ==========================================================================

  getState<T>(key: string): T | undefined {
    return this.sharedState.getState<T>(key);
  }

  async setState(key: string, value: unknown): Promise<void> {
    return this.sharedState.setState(key, value);
  }

  subscribeState(handler: StateChangeHandler): () => void {
    return this.sharedState.subscribeState(handler);
  }

  getAllState(): SharedState {
    return this.sharedState.getAllState();
  }

  // ==========================================================================
  // Message Queue — delegated
  // ==========================================================================

  async enqueue(destination: string, data: unknown, priority = 1): Promise<void> {
    this.incrementStats('message-queue', 'request');
    return this.messageQueue.enqueue(destination, data, priority);
  }

  async dequeue<T>(): Promise<T | null> {
    return this.messageQueue.dequeue<T>();
  }

  peek() {
    return this.messageQueue.peek();
  }

  clearQueue(): void {
    this.messageQueue.clearQueue();
  }

  // ==========================================================================
  // Broadcast
  // ==========================================================================

  async broadcast(event: string, data: unknown): Promise<void> {
    this._stats.update((s) => ({
      ...s,
      broadcastCount: s.broadcastCount + 1,
    }));
    await this.api.call('broadcast', [event, data]).catch(() => {});
  }

  onBroadcast(handler: EventHandler): () => void {
    return this.subscribe('broadcast', handler);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  getStats(): CommunicationStats {
    return this._stats();
  }

  resetStats(): void {
    this._stats.set({
      totalMessages: 0,
      messagesByChannel: {},
      messagesByType: {},
      queueLength: 0,
      broadcastCount: 0,
      activeSubscriptions: 0,
      stateVersion: 0,
      lastActivity: Date.now(),
    });
  }

  getChannelUsage(): Record<string, number> {
    return { ...this._stats().messagesByChannel };
  }

  // ==========================================================================
  // Private
  // ==========================================================================

  private incrementStats(channel: MessageChannel, type: MessageType): void {
    this._stats.update((s) => ({
      ...s,
      totalMessages: s.totalMessages + 1,
      messagesByChannel: {
        ...s.messagesByChannel,
        [channel]: (s.messagesByChannel[channel] || 0) + 1,
      },
      messagesByType: {
        ...s.messagesByType,
        [type]: (s.messagesByType[type] || 0) + 1,
      },
      lastActivity: Date.now(),
    }));
  }
}
