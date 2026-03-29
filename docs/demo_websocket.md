# WebSocket Demo

Real-time, bidirectional communication demonstration using WebSocket transport layer.

---

## 🚧 Status: Coming Soon

This demo is currently under development. It will showcase real-time communication between the Angular frontend and Rust backend using WebSocket transport.

---

## 🎯 Planned Features

- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Bidirectional Communication** - Client ↔ Server messaging
- ✅ **Pub/Sub Pattern** - Topic-based messaging
- ✅ **Connection Management** - Auto-reconnect, heartbeat
- ✅ **Message Queue** - Offline message buffering
- ✅ **Broadcast** - One-to-many messaging
- ✅ **Presence Tracking** - Online/offline status

---

## 🔧 Planned Architecture

### Backend (Rust)

```rust
// WebSocket server setup
use tokio::net::{TcpListener, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};

async fn websocket_handler(ws: WebSocket) {
    let (mut write, mut read) = ws.split();
    
    // Handle incoming messages
    tokio::spawn(async move {
        while let Some(msg) = read.next().await {
            // Process message
            // Broadcast to subscribers
        }
    });
}

// Topic-based pub/sub
struct WebSocketHub {
    subscribers: HashMap<String, Vec<Sender<Message>>>,
}

impl WebSocketHub {
    fn subscribe(&mut self, topic: String, sender: Sender<Message>) {
        self.subscribers.entry(topic).or_default().push(sender);
    }

    async fn publish(&self, topic: &str, message: Message) {
        if let Some(subscribers) = self.subscribers.get(topic) {
            for sender in subscribers {
                let _ = sender.send(message.clone()).await;
            }
        }
    }
}
```

### Frontend (Angular)

```typescript
// WebSocket service
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketMessage>;
  private readonly messages = signal<WebSocketMessage[]>([]);

  constructor() {
    this.socket$ = webSocket({
      url: 'ws://localhost:8080/ws',
      serializer: (msg) => JSON.stringify(msg),
      deserializer: (event) => JSON.parse(event.data),
    });

    // Auto-reconnect
    this.socket$.retryWhen(errors => 
      errors.pipe(
        delayWhen(() => timer(2000)),
        take(5)
      )
    ).subscribe();
  }

  // Subscribe to topic
  subscribe(topic: string): Observable<WebSocketMessage> {
    this.socket$.next({ type: 'subscribe', topic });
    return this.socket$.pipe(
      filter(msg => msg.topic === topic)
    );
  }

  // Publish message
  publish(topic: string, data: any): void {
    this.socket$.next({ type: 'publish', topic, data });
  }
}
```

---

## 📊 Use Cases

### Real-time Dashboard
- Live system metrics
- Real-time user activity
- Instant notifications
- Live chat

### Collaborative Features
- Multi-user editing
- Shared whiteboard
- Collaborative checklists
- Real-time comments

### Live Updates
- Stock prices
- Sports scores
- News feeds
- Social media updates

---

## 🔌 API Reference (Planned)

### Backend Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `ws:connect` | - | `connectionId` | Establish WebSocket connection |
| `ws:subscribe` | `topic` | - | Subscribe to topic |
| `ws:unsubscribe` | `topic` | - | Unsubscribe from topic |
| `ws:publish` | `topic, data` | - | Publish message to topic |
| `ws:broadcast` | `data` | - | Broadcast to all clients |
| `ws:disconnect` | - | - | Close connection |

### Frontend Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `connect()` | - | `Observable` | Connect to WebSocket |
| `subscribe(topic)` | `string` | `Observable` | Subscribe to topic |
| `publish(topic, data)` | `string, any` | `void` | Publish message |
| `disconnect()` | - | `void` | Disconnect |

---

## 🎨 Planned UI Components

```typescript
@Component({
  selector: 'app-websocket-demo',
  template: `
    <div class="websocket-demo">
      <!-- Connection Status -->
      <div class="connection-status" [class.connected]="connected()">
        {{ connected() ? '🟢 Connected' : '🔴 Disconnected' }}
      </div>

      <!-- Subscribe to Topics -->
      <div class="topics">
        <h3>Topics</h3>
        @for (topic of topics(); track topic) {
          <div class="topic">
            <input type="checkbox" [checked]="isSubscribed(topic)"
                   (change)="toggleSubscription(topic)" />
            <span>{{ topic }}</span>
            <span class="message-count">
              {{ getMessageCount(topic) }}
            </span>
          </div>
        }
      </div>

      <!-- Message Stream -->
      <div class="message-stream">
        @for (msg of messages(); track msg.id) {
          <div class="message" [class.incoming]="msg.direction === 'in'">
            <div class="message-header">
              <span class="topic">{{ msg.topic }}</span>
              <span class="time">{{ msg.timestamp | date:'HH:mm:ss' }}</span>
            </div>
            <div class="message-body">{{ msg.data }}</div>
          </div>
        }
      </div>

      <!-- Publish Message -->
      <div class="publish-form">
        <select [(ngModel)]="selectedTopic">
          @for (topic of topics(); track topic) {
            <option [value]="topic">{{ topic }}</option>
          }
        </select>
        <input type="text" [(ngModel)]="messageText" 
               placeholder="Message..." />
        <button (click)="publish()">Send</button>
      </div>
    </div>
  `
})
export class WebSocketDemoComponent {
  private readonly wsService = inject(WebSocketService);
  
  connected = signal(false);
  topics = signal(['updates', 'notifications', 'chat']);
  messages = signal<WebSocketMessage[]>([]);
  selectedTopic = 'updates';
  messageText = '';

  ngOnInit(): void {
    this.connect();
  }

  connect(): void {
    this.wsService.connect().subscribe({
      next: () => this.connected.set(true),
      error: () => this.connected.set(false)
    });
  }

  subscribe(topic: string): void {
    this.wsService.subscribe(topic).subscribe(msg => {
      this.messages.update(msgs => [...msgs, msg]);
    });
  }

  publish(): void {
    this.wsService.publish(this.selectedTopic, this.messageText);
    this.messageText = '';
  }
}
```

---

## 🧪 Testing Plan

### Backend Tests

```rust
#[tokio::test]
async fn test_websocket_connection() {
    // Test connection establishment
}

#[tokio::test]
async fn test_subscribe_publish() {
    // Test topic subscription and message delivery
}

#[tokio::test]
async fn test_broadcast() {
    // Test broadcast to all clients
}

#[tokio::test]
async fn test_reconnect() {
    // Test auto-reconnect functionality
}
```

### Frontend Tests

```typescript
describe('WebSocketService', () => {
  it('should connect to WebSocket server', () => {
    // Test connection
  });

  it('should receive messages from subscribed topic', () => {
    // Test subscription and message reception
  });

  it('should auto-reconnect on disconnect', () => {
    // Test reconnection logic
  });
});
```

---

## 📚 Resources

### Documentation
- [WebSocket RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [tokio-tungstenite](https://docs.rs/tokio-tungstenite)

### Tutorials
- Building Real-time Apps with Rust WebSockets
- Angular WebSocket Client Best Practices
- Scaling WebSocket Applications

---

## 🗓️ Development Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Backend WebSocket server | 1 week |
| **Phase 2** | Frontend WebSocket service | 1 week |
| **Phase 3** | UI components | 1 week |
| **Phase 4** | Testing & optimization | 1 week |
| **Total** | | **4 weeks** |

---

## 📝 Related Documentation

- [Event Bus Service](#/architecture#event-driven-design)
- [Communication Channels](#/architecture#frontend-backend-communication)
- [Message Queue Service](#/angular-services)

---

**Status:** 🚧 In Development  
**Expected Release:** Q2 2026  
**Last Updated:** 2026-03-29
