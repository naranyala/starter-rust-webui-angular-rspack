// Communication Service Facade - Delegates to specialized channel services
// This service is deprecated. Use the specialized services directly:
// - WebUiBridgeService for RPC calls
// - EventBusService for pub/sub events
// - SharedStateService for shared state
// - MessageQueueService for async messaging
// - BroadcastService for broadcasting
import { Injectable, inject } from '@angular/core';
import { WebUiBridgeService } from './webui-bridge.service';
import { EventBusService } from '../app/services/event-bus.service';
import { SharedStateService } from './shared-state.service';
import { MessageQueueService } from './message-queue.service';
import { BroadcastService } from './broadcast.service';

// Re-export types for backward compatibility
export type { Subscription } from '../app/services/event-bus.service';
export type { SharedState } from './shared-state.service';
export type { Message } from './message-queue.service';
export type { BroadcastMessage } from './broadcast.service';

/**
 * @deprecated Use specialized services directly. This facade is for backward compatibility.
 */
@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly bridge = inject(WebUiBridgeService);
  private readonly eventBus = inject(EventBusService);
  private readonly state = inject(SharedStateService);
  private readonly queue = inject(MessageQueueService);
  private readonly broadcastService = inject(BroadcastService);

  // Delegated properties
  readonly queueLength = this.queue.queueLength;

  /**
   * @deprecated Use WebUiBridgeService.callOrThrow()
   */
  async call<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return this.bridge.callOrThrow<T>(functionName, args);
  }

  /**
   * @deprecated Use WebUiBridgeService.callWithResponse()
   */
  async callWithResponse<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return this.bridge.callWithResponse<T>(functionName, args);
  }

  /**
   * @deprecated Use EventBusService.subscribe()
   */
  subscribe(event: string, handler: (data: unknown, event: string) => void): () => void {
    const sub = this.eventBus.subscribe(event, (data: unknown) => handler(data, event));
    return () => sub.unsubscribe();
  }

  /**
   * @deprecated Use EventBusService.publish()
   */
  async publish(event: string, data: unknown): Promise<void> {
    this.eventBus.publish(event, data);
  }

  /**
   * @deprecated Use EventBusService.emit()
   */
  emit(event: string, data: unknown): void {
    this.eventBus.publish(event, data);
  }

  /**
   * @deprecated Use SharedStateService.getState()
   */
  getState<T>(key: string): T | undefined {
    return this.state.getState<T>(key);
  }

  /**
   * @deprecated Use SharedStateService.setState()
   */
  async setState(key: string, value: unknown): Promise<void> {
    await this.state.setState(key, value);
  }

  /**
   * @deprecated Use SharedStateService.subscribeState()
   */
  subscribeState(handler: (key: string, value: unknown) => void): () => void {
    return this.state.subscribeState(handler);
  }

  /**
   * @deprecated Use MessageQueueService.enqueue()
   */
  async enqueue(destination: string, data: unknown, priority: number = 1): Promise<void> {
    await this.queue.enqueue(destination, data, priority);
  }

  /**
   * @deprecated Use MessageQueueService.dequeue()
   */
  async dequeue<T>(): Promise<T | null> {
    return this.queue.dequeue<T>();
  }

  /**
   * @deprecated Use MessageQueueService.peek()
   */
  peek() {
    return this.queue.peek();
  }

  /**
   * @deprecated Use MessageQueueService.clearQueue()
   */
  clearQueue(): void {
    this.queue.clearQueue();
  }

  /**
   * @deprecated Use BroadcastService.broadcast()
   */
  async broadcast(event: string, data: unknown): Promise<void> {
    await this.broadcastService.broadcast(event, data);
  }

  /**
   * @deprecated Use BroadcastService.onBroadcast()
   */
  onBroadcast(handler: (data: unknown) => void): () => void {
    return this.broadcastService.onBroadcast(msg => handler(msg.data));
  }

  /**
   * Get aggregated stats from all services
   */
  getStats() {
    return {
      bridge: this.bridge.getStats(),
      broadcast: this.broadcastService.getStats(),
      queueLength: this.queue.queueLength(),
      stateVersion: this.state.version$(),
    };
  }

  /**
   * Reset all statistics
   */
  resetStats(): void {
    this.bridge.resetStats();
    this.broadcastService.resetStats();
  }
}
