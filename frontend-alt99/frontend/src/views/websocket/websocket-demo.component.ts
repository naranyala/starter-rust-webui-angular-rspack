/**
 * WebSocket / Real-time Communication Demo
 *
 * Demonstrates real-time event bus integration:
 * - Event publishing and subscribing
 * - Message queue operations
 * - Broadcast messaging
 * - Shared state synchronization
 * - Live event monitoring
 */

import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { ApiService } from '../../core/api.service';
import { CommunicationService, Message } from '../../core/communication.service';

export interface EventMessage {
  id: string;
  event: string;
  data: unknown;
  timestamp: number;
  source: 'local' | 'remote';
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: number;
}

@Component({
  selector: 'app-websocket-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">🔌</span>
            Real-time Communication Demo
          </h1>
          <p class="demo-description">Event bus, message queue, broadcast, and shared state synchronization</p>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="connection-status" [class.connected]="isConnected()" [class.disconnected]="!isConnected()">
        <span class="status-indicator"></span>
        <span class="status-text">{{ isConnected() ? 'Connected' : 'Disconnected' }}</span>
        <span class="status-detail">{{ activeSubscriptions() }} active subscriptions</span>
      </div>

      <!-- Stats Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-card stat-primary">
          <div class="stat-icon">📨</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().totalMessages }}</span>
            <span class="stat-label">Total Messages</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">📬</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().broadcastCount }}</span>
            <span class="stat-label">Broadcasts</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().queueLength }}</span>
            <span class="stat-label">Queue Length</span>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">🔄</div>
          <div class="stat-content">
            <span class="stat-value">v{{ stats().stateVersion }}</span>
            <span class="stat-label">State Version</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Event Publisher -->
        <div class="panel panel-left">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-icon">📤</span>
              Event Publisher
            </h2>
          </div>

          <div class="panel-body">
            <form class="publish-form" (ngSubmit)="publishEvent()">
              <div class="form-group">
                <label class="form-label">Event Name</label>
                <input
                  type="text"
                  class="form-input"
                  [(ngModel)]="eventName"
                  name="eventName"
                  placeholder="e.g., user.action"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Event Data (JSON)</label>
                <textarea
                  class="form-input form-textarea"
                  [(ngModel)]="eventData"
                  name="eventData"
                  placeholder='{"key": "value"}'
                  rows="4"
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="publishing()">
                  {{ publishing() ? 'Publishing...' : 'Publish Event' }}
                </button>
              </div>
            </form>

            <!-- Quick Events -->
            <div class="quick-events">
              <h3 class="quick-title">Quick Events</h3>
              <div class="quick-buttons">
                <button class="btn btn-sm btn-secondary" (click)="quickEvent('ping')">Ping</button>
                <button class="btn btn-sm btn-secondary" (click)="quickEvent('notification')">Notification</button>
                <button class="btn btn-sm btn-secondary" (click)="quickEvent('state-change')">State Change</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Log -->
        <div class="panel panel-right">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-icon">📜</span>
              Event Log
            </h2>
            <button class="btn btn-sm btn-secondary" (click)="clearLog()">Clear</button>
          </div>

          <div class="panel-body panel-body-scroll">
            @if (eventLog().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">📭</span>
                <span>No events yet</span>
              </div>
            } @else {
              <div class="event-log">
                @for (event of eventLog(); track event.id) {
                  <div class="event-item" [class.local]="event.source === 'local'" [class.remote]="event.source === 'remote'">
                    <div class="event-header">
                      <span class="event-badge">{{ event.event }}</span>
                      <span class="event-source">{{ event.source }}</span>
                      <span class="event-time">{{ formatTime(event.timestamp) }}</span>
                    </div>
                    <pre class="event-data">{{ formatJson(event.data) }}</pre>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Bottom Panels -->
      <div class="bottom-grid">
        <!-- Message Queue -->
        <div class="panel panel-full">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-icon">📋</span>
              Message Queue
            </h2>
            <div class="panel-actions">
              <button class="btn btn-sm btn-secondary" (click)="enqueueMessage()">Enqueue</button>
              <button class="btn btn-sm btn-secondary" (click)="dequeueMessage()">Dequeue</button>
              <button class="btn btn-sm btn-secondary" (click)="clearQueue()">Clear</button>
            </div>
          </div>

          <div class="panel-body">
            <div class="queue-input-group">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="queueDestination"
                placeholder="Destination (e.g., worker-1)"
              />
              <input
                type="text"
                class="form-input"
                [(ngModel)]="queueData"
                placeholder="Message data"
              />
              <select class="form-select" [(ngModel)]="queuePriority">
                <option [ngValue]="1">Low</option>
                <option [ngValue]="5">Medium</option>
                <option [ngValue]="10">High</option>
              </select>
            </div>

            @if (messageQueue().length === 0) {
              <div class="empty-state-small">
                <span>Queue is empty</span>
              </div>
            } @else {
              <div class="queue-list">
                @for (msg of messageQueue(); track msg.id; let i = $index) {
                  <div class="queue-item">
                    <span class="queue-priority" [class.high]="msg.priority >= 10" [class.medium]="msg.priority >= 5 && msg.priority < 10" [class.low]="msg.priority < 5">
                      P{{ msg.priority }}
                    </span>
                    <span class="queue-destination">{{ msg.destination }}</span>
                    <span class="queue-data">{{ formatJsonInline(msg.data) }}</span>
                    <span class="queue-time">{{ formatTime(msg.timestamp) }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Shared State -->
        <div class="panel panel-half">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-icon">🔄</span>
              Shared State
            </h2>
            <button class="btn btn-sm btn-secondary" (click)="syncState()">Sync</button>
          </div>

          <div class="panel-body">
            <div class="state-input-group">
              <input
                type="text"
                class="form-input form-input-sm"
                [(ngModel)]="stateKey"
                placeholder="Key"
              />
              <input
                type="text"
                class="form-input form-input-sm"
                [(ngModel)]="stateValue"
                placeholder="Value"
              />
              <button class="btn btn-sm btn-primary" (click)="setState()">Set</button>
            </div>

            <div class="state-list">
              @for (item of sharedStateList(); track item.key) {
                <div class="state-item">
                  <span class="state-key">{{ item.key }}</span>
                  <span class="state-value">{{ item.value }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Broadcast -->
        <div class="panel panel-half">
          <div class="panel-header">
            <h2 class="panel-title">
              <span class="panel-icon">📢</span>
              Broadcast
            </h2>
            <button class="btn btn-sm btn-primary" (click)="broadcastTest()">Send Broadcast</button>
          </div>

          <div class="panel-body">
            <div class="broadcast-form">
              <input
                type="text"
                class="form-input"
                [(ngModel)]="broadcastEvent"
                placeholder="Event name"
              />
              <input
                type="text"
                class="form-input"
                [(ngModel)]="broadcastData"
                placeholder="Broadcast data"
              />
            </div>

            <div class="broadcast-log">
              @for (msg of broadcastLog(); track msg.id) {
                <div class="broadcast-item">
                  <span class="broadcast-event">{{ msg.event }}</span>
                  <span class="broadcast-data">{{ formatJsonInline(msg.data) }}</span>
                  <span class="broadcast-time">{{ formatTime(msg.timestamp) }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    .demo-header {
      margin-bottom: 24px;
    }

    .demo-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 32px;
    }

    .demo-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .connection-status.connected {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .connection-status.disconnected {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    .connected .status-indicator {
      background: #10b981;
    }

    .disconnected .status-indicator {
      background: #ef4444;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-text {
      font-weight: 600;
      color: #fff;
    }

    .status-detail {
      font-size: 13px;
      color: #94a3b8;
    }

    .stats-dashboard {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-primary .stat-icon { background: rgba(59, 130, 246, 0.2); }
    .stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); }
    .stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); }
    .stat-info .stat-icon { background: rgba(6, 182, 212, 0.2); }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }

    .panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-icon {
      font-size: 18px;
    }

    .panel-actions {
      display: flex;
      gap: 8px;
    }

    .panel-body {
      padding: 20px;
    }

    .panel-body-scroll {
      max-height: 400px;
      overflow-y: auto;
    }

    .panel-full {
      grid-column: 1 / -1;
    }

    .panel-half {
      grid-column: span 1;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
    }

    .form-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }

    .form-textarea {
      resize: vertical;
      font-family: 'Fira Code', monospace;
    }

    .form-input-sm {
      padding: 8px 12px;
      font-size: 13px;
    }

    .form-select {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.3);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .quick-events {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    .quick-title {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .quick-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .event-log {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .event-item {
      padding: 12px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 8px;
      border-left: 3px solid rgba(148, 163, 184, 0.3);
    }

    .event-item.local {
      border-left-color: #06b6d4;
    }

    .event-item.remote {
      border-left-color: #10b981;
    }

    .event-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .event-badge {
      padding: 4px 10px;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #60a5fa;
    }

    .event-source {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .event-time {
      font-size: 11px;
      color: #64748b;
      margin-left: auto;
    }

    .event-data {
      background: rgba(30, 41, 59, 0.5);
      padding: 8px;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      color: #e2e8f0;
      margin: 0;
      overflow-x: auto;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #94a3b8;
    }

    .empty-state-small {
      text-align: center;
      padding: 20px;
      color: #94a3b8;
      font-size: 14px;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .queue-input-group,
    .state-input-group,
    .broadcast-form {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }

    .queue-input-group {
      grid-template-columns: 1fr 2fr auto;
    }

    .state-input-group {
      grid-template-columns: 1fr 2fr auto;
    }

    .broadcast-form {
      grid-template-columns: 1fr 2fr;
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .queue-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 6px;
      font-size: 13px;
    }

    .queue-priority {
      padding: 2px 8px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
    }

    .queue-priority.high {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .queue-priority.medium {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .queue-priority.low {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .queue-destination {
      font-weight: 600;
      color: #fff;
      min-width: 100px;
    }

    .queue-data {
      flex: 1;
      color: #94a3b8;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .queue-time {
      font-size: 11px;
      color: #64748b;
    }

    .state-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .state-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 6px;
      font-size: 13px;
    }

    .state-key {
      font-weight: 600;
      color: #60a5fa;
    }

    .state-value {
      color: #e2e8f0;
    }

    .broadcast-log {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
    }

    .broadcast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 6px;
      font-size: 12px;
    }

    .broadcast-event {
      font-weight: 600;
      color: #10b981;
      min-width: 120px;
    }

    .broadcast-data {
      flex: 1;
      color: #94a3b8;
    }

    .broadcast-time {
      font-size: 11px;
      color: #64748b;
    }

    @media (max-width: 1200px) {
      .stats-dashboard {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        grid-template-columns: 1fr;
      }

      .bottom-grid {
        grid-template-columns: 1fr;
      }

      .panel-half {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .stats-dashboard {
        grid-template-columns: 1fr;
      }

      .queue-input-group,
      .state-input-group {
        grid-template-columns: 1fr;
      }

      .broadcast-form {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WebsocketDemoComponent implements OnInit, OnDestroy {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);
  private readonly comm = inject(CommunicationService);

  // Connection State
  isConnected = signal(true);
  activeSubscriptions = signal(0);

  // Stats
  stats = signal({
    totalMessages: 0,
    messagesByChannel: {},
    messagesByType: {},
    queueLength: 0,
    broadcastCount: 0,
    activeSubscriptions: 0,
    stateVersion: 0,
    lastActivity: Date.now(),
  });

  // Event Log
  eventLog = signal<EventMessage[]>([]);
  eventName = '';
  eventData = '{}';
  publishing = signal(false);

  // Message Queue
  messageQueue = signal<Message[]>([]);
  queueDestination = 'worker-1';
  queueData = '';
  queuePriority = 1;

  // Shared State
  sharedStateList = signal<{ key: string; value: string }[]>([]);
  stateKey = '';
  stateValue = '';

  // Broadcast
  broadcastLog = signal<EventMessage[]>([]);
  broadcastEvent = 'broadcast.test';
  broadcastData = '{"message": "Hello everyone!"}';

  private eventUnsubscribe?: () => void;
  private broadcastUnsubscribe?: () => void;
  private stateUnsubscribe?: () => void;
  private statsInterval?: number;

  ngOnInit(): void {
    this.setupEventListeners();
    this.setupStateSync();
    this.startStatsPolling();
    this.loadQueue();
  }

  ngOnDestroy(): void {
    this.eventUnsubscribe?.();
    this.broadcastUnsubscribe?.();
    this.stateUnsubscribe?.();
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  setupEventListeners(): void {
    // Subscribe to all events
    this.eventUnsubscribe = this.comm.subscribe('**', (data, event) => {
      this.addEventLog({
        id: this.generateId(),
        event,
        data,
        timestamp: Date.now(),
        source: 'remote',
      });
    });

    // Subscribe to broadcasts
    this.broadcastUnsubscribe = this.comm.onBroadcast((data) => {
      const broadcast = data as { event: string; data: unknown };
      this.broadcastLog.update(log => [
        {
          id: this.generateId(),
          event: broadcast.event,
          data: broadcast.data,
          timestamp: Date.now(),
          source: 'remote',
        },
        ...log.slice(0, 49),
      ]);
    });

    // Subscribe to state changes
    this.stateUnsubscribe = this.comm.subscribeState((key, value) => {
      this.updateStateList();
      this.addEventLog({
        id: this.generateId(),
        event: 'state-change',
        data: { key, value },
        timestamp: Date.now(),
        source: 'remote',
      });
    });
  }

  setupStateSync(): void {
    this.updateStateList();
  }

  startStatsPolling(): void {
    this.statsInterval = window.setInterval(() => {
      const commStats = this.comm.getStats();
      this.stats.set(commStats);
      this.activeSubscriptions.set(commStats.activeSubscriptions);
      this.updateStateList();
    }, 1000);
  }

  updateStateList(): void {
    const state = this.comm.getAllState();
    this.sharedStateList.set(
      Object.entries(state).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }))
    );
  }

  async loadQueue(): Promise<void> {
    try {
      // For demo, show local queue
      const queue = await this.comm.dequeue<any>();
      if (queue) {
        this.messageQueue.update(q => [...q, queue as Message]);
      }
    } catch {
      // Ignore errors
    }
  }

  addEventLog(event: EventMessage): void {
    this.eventLog.update(log => [event, ...log.slice(0, 99)]);
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  formatJson(data: unknown): string {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  formatJsonInline(data: unknown): string {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data));
      }
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }

  async publishEvent(): Promise<void> {
    if (!this.eventName.trim()) {
      this.logger.warn('Event name is required');
      return;
    }

    this.publishing.set(true);

    try {
      let data: unknown = this.eventData;
      try {
        data = JSON.parse(this.eventData);
      } catch {
        // Use as string if not valid JSON
      }

      // Log locally first
      this.addEventLog({
        id: this.generateId(),
        event: this.eventName,
        data,
        timestamp: Date.now(),
        source: 'local',
      });

      // Publish to backend
      await this.comm.publish(this.eventName, data);
      this.logger.info(`Event published: ${this.eventName}`);

      this.eventName = '';
      this.eventData = '{}';
    } catch (error) {
      this.logger.error('Failed to publish event', error);
    } finally {
      this.publishing.set(false);
    }
  }

  quickEvent(type: string): Promise<void> {
    const events: Record<string, { name: string; data: unknown }> = {
      'ping': { name: 'system.ping', data: { timestamp: Date.now() } },
      'notification': { name: 'notification.show', data: { title: 'Test', message: 'This is a test notification' } },
      'state-change': { name: 'state.update', data: { key: 'demo', value: Math.random() } },
    };

    const event = events[type];
    if (event) {
      this.eventName = event.name;
      this.eventData = JSON.stringify(event.data);
      return this.publishEvent();
    }

    return Promise.resolve();
  }

  clearLog(): void {
    this.eventLog.set([]);
  }

  async enqueueMessage(): Promise<void> {
    if (!this.queueDestination.trim() || !this.queueData.trim()) {
      this.logger.warn('Destination and data are required');
      return;
    }

    try {
      await this.comm.enqueue(this.queueDestination, this.queueData, this.queuePriority);
      this.logger.info(`Message enqueued: ${this.queueDestination}`);

      this.messageQueue.update(queue => [
        {
          id: this.generateId(),
          channel: 'message-queue',
          type: 'request',
          source: 'frontend',
          destination: this.queueDestination,
          timestamp: Date.now(),
          data: this.queueData,
          priority: this.queuePriority,
        },
        ...queue.slice(0, 49),
      ]);

      this.queueData = '';
    } catch (error) {
      this.logger.error('Failed to enqueue message', error);
    }
  }

  async dequeueMessage(): Promise<void> {
    try {
      const message = await this.comm.dequeue<any>();
      if (message) {
        this.logger.info(`Message dequeued: ${JSON.stringify(message)}`);
      } else {
        this.logger.info('Queue is empty');
      }
    } catch (error) {
      this.logger.error('Failed to dequeue message', error);
    }
  }

  clearQueue(): void {
    this.comm.clearQueue();
    this.messageQueue.set([]);
    this.logger.info('Queue cleared');
  }

  async setState(): Promise<void> {
    if (!this.stateKey.trim()) {
      this.logger.warn('State key is required');
      return;
    }

    try {
      await this.comm.setState(this.stateKey, this.stateValue);
      this.logger.info(`State set: ${this.stateKey} = ${this.stateValue}`);
      this.stateKey = '';
      this.stateValue = '';
      this.updateStateList();
    } catch (error) {
      this.logger.error('Failed to set state', error);
    }
  }

  async syncState(): Promise<void> {
    try {
      // Trigger state sync
      this.updateStateList();
      this.logger.info('State synchronized');
    } catch (error) {
      this.logger.error('Failed to sync state', error);
    }
  }

  async broadcastTest(): Promise<void> {
    try {
      let data: unknown = this.broadcastData;
      try {
        data = JSON.parse(this.broadcastData);
      } catch {
        // Use as string
      }

      await this.comm.broadcast(this.broadcastEvent, data);
      this.logger.info(`Broadcast sent: ${this.broadcastEvent}`);

      this.broadcastLog.update(log => [
        {
          id: this.generateId(),
          event: this.broadcastEvent,
          data,
          timestamp: Date.now(),
          source: 'local',
        },
        ...log.slice(0, 49),
      ]);
    } catch (error) {
      this.logger.error('Failed to broadcast', error);
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
