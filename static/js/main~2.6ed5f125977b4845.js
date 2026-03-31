"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["969"],{2039(t,e,a){a.d(e,{d:()=>d});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317);let d=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.loading=(0,s.vPA)(!1),this.migrating=(0,s.vPA)(!1),this.migrationComplete=(0,s.vPA)(!1),this.migrationProgress=(0,s.vPA)(0),this.sqliteRecordCount=(0,s.vPA)(0),this.duckdbRecordCount=(0,s.vPA)(0),this.sqliteUsers=(0,s.vPA)([]),this.duckdbUsers=(0,s.vPA)([]),this.migrationDirection=(0,s.vPA)("sqlite-to-duckdb"),this.migrationSteps=(0,s.vPA)([]),this.migrationStats=(0,s.vPA)({totalRecords:0,migratedRecords:0,failedRecords:0,duration:0,recordsPerSecond:0}),this.migrationHistory=(0,s.vPA)([]),this.migrationMode="full",this.batchSize=50,this.previewSource=(0,s.vPA)("sqlite")}ngOnInit(){this.loadSqliteData(),this.loadDuckdbData()}async loadSqliteData(){this.loading.set(!0);try{let t=await this.api.callOrThrow("getUsers",[]);this.sqliteUsers.set(t),this.sqliteRecordCount.set(t.length)}catch(t){this.logger.error("Failed to load SQLite data",t)}finally{this.loading.set(!1)}}async loadDuckdbData(){this.loading.set(!0);try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);this.duckdbUsers.set(t),this.duckdbRecordCount.set(t.length)}catch(t){this.logger.error("Failed to load DuckDB data",t)}finally{this.loading.set(!1)}}setMigrationDirection(t){this.migrationDirection.set(t)}async startMigration(){this.migrating.set(!0),this.migrationComplete.set(!1),this.migrationProgress.set(0),this.migrationSteps.set([{step:1,description:"Preparing migration...",status:"pending"},{step:2,description:"Reading source data...",status:"pending"},{step:3,description:"Transforming data...",status:"pending"},{step:4,description:"Writing to target...",status:"pending"},{step:5,description:"Verifying migration...",status:"pending"}]);let t=Date.now();try{this.updateStepStatus(1,"running"),await this.sleep(500),this.updateStepStatus(1,"completed","Migration initialized",Date.now()-t),this.updateStepStatus(2,"running");let e=await this.readSourceData(),a="sample"===this.migrationMode?Math.min(100,e.length):e.length;this.updateStepStatus(2,"completed",`Read ${e.length} records`,Date.now()-t),this.migrationProgress.set(20),this.updateStepStatus(3,"running");let s=this.transformData(e.slice(0,a));await this.sleep(300),this.updateStepStatus(3,"completed",`Transformed ${s.length} records`,Date.now()-t),this.migrationProgress.set(50),this.updateStepStatus(4,"running");let i=0,r=0,o=Math.ceil(s.length/this.batchSize);for(let t=0;t<o;t++){let e=s.slice(t*this.batchSize,(t+1)*this.batchSize),a=await this.writeToTarget(e);i+=a.success,r+=a.failed,this.migrationProgress.set(50+(t+1)/o*30)}this.updateStepStatus(4,"completed",`Migrated ${i} records`,Date.now()-t),this.migrationProgress.set(90),this.updateStepStatus(5,"running"),await this.verifyMigration(i),this.updateStepStatus(5,"completed","Verification complete",Date.now()-t),this.migrationProgress.set(100);let n=Date.now()-t;this.migrationStats.set({totalRecords:a,migratedRecords:i,failedRecords:r,duration:n,recordsPerSecond:Math.round(i/n*1e3)}),this.migrationHistory.update(t=>[{direction:this.migrationDirection(),mode:this.migrationMode,records:i,duration:n,success:0===r,timestamp:new Date},...t].slice(0,10)),await this.loadSqliteData(),await this.loadDuckdbData()}catch(t){this.logger.error("Migration failed",t),this.updateStepStatus(4,"failed",t.message)}finally{this.migrating.set(!1),this.migrationComplete.set(!0)}}async readSourceData(){return"sqlite-to-duckdb"===this.migrationDirection()?await this.api.callOrThrow("getUsers",[]):await this.api.callOrThrow("duckdbGetUsers",[])}transformData(t){return t.map(t=>({...t,created_at:t.created_at||new Date().toISOString()}))}async writeToTarget(t){let e=0,a=0;if("sqlite-to-duckdb"===this.migrationDirection())for(let s of t)try{await this.api.callOrThrow("duckdbCreateUser",[{name:s.name,email:s.email,age:s.age,status:s.status}]),e++}catch{a++}else for(let s of t)try{await this.api.callOrThrow("createUser",[{name:s.name,email:s.email,age:s.age,status:s.status}]),e++}catch{a++}return{success:e,failed:a}}async verifyMigration(t){await this.sleep(300)}updateStepStatus(t,e,a,s){this.migrationSteps.update(i=>i.map(i=>i.step===t?{...i,status:e,message:a,duration:s??i.duration}:i))}sleep(t){return new Promise(e=>setTimeout(e,t))}};d=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-data-migration-demo",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="migration-container">
      <header class="migration-header">
        <h1>\u{1F504} Data Migration Demo</h1>
        <p>Migrate data between SQLite and DuckDB databases</p>
      </header>

      <!-- Database Status Cards -->
      <div class="status-cards">
        <div class="db-status-card sqlite">
          <div class="db-icon">\u{1F5C4}\uFE0F</div>
          <div class="db-info">
            <h3>SQLite</h3>
            <p class="record-count">{{ sqliteRecordCount() }} records</p>
          </div>
          <button class="btn btn-sm" (click)="loadSqliteData()" [disabled]="loading()">\u{1F504}</button>
        </div>

        <div class="migration-arrow">
          <span>\u21C4</span>
        </div>

        <div class="db-status-card duckdb">
          <div class="db-icon">\u{1F986}</div>
          <div class="db-info">
            <h3>DuckDB</h3>
            <p class="record-count">{{ duckdbRecordCount() }} records</p>
          </div>
          <button class="btn btn-sm" (click)="loadDuckdbData()" [disabled]="loading()">\u{1F504}</button>
        </div>
      </div>

      <!-- Migration Direction Selector -->
      <div class="direction-selector">
        <button
          class="direction-btn"
          [class.active]="migrationDirection() === 'sqlite-to-duckdb'"
          (click)="setMigrationDirection('sqlite-to-duckdb')">
          \u{1F5C4}\uFE0F \u2192 \u{1F986}
          <span class="direction-label">SQLite to DuckDB</span>
        </button>
        <button
          class="direction-btn"
          [class.active]="migrationDirection() === 'duckdb-to-sqlite'"
          (click)="setMigrationDirection('duckdb-to-sqlite')">
          \u{1F986} \u2192 \u{1F5C4}\uFE0F
          <span class="direction-label">DuckDB to SQLite</span>
        </button>
      </div>

      <!-- Migration Controls -->
      <div class="migration-controls">
        <div class="control-group">
          <label>Migration Mode</label>
          <select [(ngModel)]="migrationMode" class="form-select">
            <option value="full">Full Migration (All Records)</option>
            <option value="incremental">Incremental (New/Updated Only)</option>
            <option value="sample">Sample (100 Records)</option>
          </select>
        </div>

        <div class="control-group">
          <label>Batch Size</label>
          <select [(ngModel)]="batchSize" class="form-select">
            <option [ngValue]="10">10 records/batch</option>
            <option [ngValue]="50">50 records/batch</option>
            <option [ngValue]="100">100 records/batch</option>
            <option [ngValue]="500">500 records/batch</option>
          </select>
        </div>

        <button
          class="btn btn-primary btn-lg"
          (click)="startMigration()"
          [disabled]="loading() || migrating()">
          {{ migrating() ? '\u23F3 Migrating...' : '\u{1F680} Start Migration' }}
        </button>
      </div>

      <!-- Migration Progress -->
      @if (migrating() || migrationComplete()) {
        <div class="migration-progress">
          <div class="progress-header">
            <h3>Migration Progress</h3>
            @if (migrationComplete()) {
              <span class="complete-badge">\u2705 Complete</span>
            }
          </div>

          <!-- Progress Bar -->
          <div class="progress-bar-container">
            <div class="progress-bar" [style.width.%]="migrationProgress()"></div>
            <span class="progress-text">{{ migrationProgress() }}%</span>
          </div>

          <!-- Migration Steps -->
          <div class="migration-steps">
            @for (step of migrationSteps(); track step.step) {
              <div class="step-item" [class]="'step-' + step.status">
                <div class="step-indicator">
                  @if (step.status === 'pending') {
                    <span>\u23F3</span>
                  } @else if (step.status === 'running') {
                    <span class="spinner-small"></span>
                  } @else if (step.status === 'completed') {
                    <span>\u2705</span>
                  } @else if (step.status === 'failed') {
                    <span>\u274C</span>
                  }
                </div>
                <div class="step-info">
                  <div class="step-description">{{ step.description }}</div>
                  @if (step.message) {
                    <div class="step-message">{{ step.message }}</div>
                  }
                  @if (step.duration) {
                    <div class="step-duration">{{ step.duration }}ms</div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Migration Stats -->
          @if (migrationComplete()) {
            <div class="migration-stats">
              <div class="stat-item">
                <span class="stat-label">Total Records:</span>
                <span class="stat-value">{{ migrationStats().totalRecords }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Migrated:</span>
                <span class="stat-value success">{{ migrationStats().migratedRecords }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Failed:</span>
                <span class="stat-value error">{{ migrationStats().failedRecords }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Duration:</span>
                <span class="stat-value">{{ migrationStats().duration }}ms</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Speed:</span>
                <span class="stat-value highlight">{{ migrationStats().recordsPerSecond }} rec/s</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Data Preview -->
      <div class="data-preview">
        <div class="preview-header">
          <h3>\u{1F4CA} Data Preview</h3>
          <div class="preview-toggle">
            <button
              class="toggle-btn"
              [class.active]="previewSource() === 'sqlite'"
              (click)="previewSource.set('sqlite')">
              \u{1F5C4}\uFE0F SQLite
            </button>
            <button
              class="toggle-btn"
              [class.active]="previewSource() === 'duckdb'"
              (click)="previewSource.set('duckdb')">
              \u{1F986} DuckDB
            </button>
          </div>
        </div>

        @if (previewSource() === 'sqlite') {
          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @for (user of sqliteUsers(); track user.id) {
                  <tr>
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.age }}</td>
                    <td><span class="status-badge status-{{ user.status }}">{{ user.status }}</span></td>
                    <td>{{ user.created_at | date:'short' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="6" class="empty-state">No data in SQLite</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="preview-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @for (user of duckdbUsers(); track user.id) {
                  <tr>
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.age }}</td>
                    <td><span class="status-badge status-{{ user.status }}">{{ user.status }}</span></td>
                    <td>{{ user.created_at | date:'short' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="6" class="empty-state">No data in DuckDB</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Migration History -->
      <div class="migration-history">
        <h3>\u{1F4DC} Migration History</h3>
        @if (migrationHistory().length > 0) {
          <div class="history-list">
            @for (record of migrationHistory(); track record.timestamp) {
              <div class="history-item">
                <div class="history-icon">{{ record.direction === 'sqlite-to-duckdb' ? '\u{1F5C4}\uFE0F\u2192\u{1F986}' : '\u{1F986}\u2192\u{1F5C4}\uFE0F' }}</div>
                <div class="history-info">
                  <div class="history-mode">{{ record.mode }}</div>
                  <div class="history-details">{{ record.records }} records in {{ record.duration }}ms</div>
                </div>
                <div class="history-status" [class.success]="record.success">
                  {{ record.success ? '\u2705' : '\u274C' }}
                </div>
                <div class="history-time">{{ record.timestamp | date:'medium' }}</div>
              </div>
            }
          </div>
        } @else {
          <p class="history-empty">No migration history yet</p>
        }
      </div>
    </div>
  `,styles:[`
    .migration-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .migration-header {
      margin-bottom: 24px;
    }

    .migration-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .migration-header p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .status-cards {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .db-status-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }

    .db-status-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .db-status-card.sqlite {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .db-status-card.duckdb {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .db-icon {
      font-size: 40px;
    }

    .db-info h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 4px;
    }

    .record-count {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .migration-arrow {
      font-size: 32px;
      color: #64748b;
      padding: 12px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 8px 12px;
      font-size: 13px;
    }

    .btn-lg {
      padding: 14px 28px;
      font-size: 16px;
    }

    .btn-primary { background: #3b82f6; color: #fff; }
    .btn:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }

    .direction-selector {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .direction-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 24px;
    }

    .direction-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .direction-btn.active {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
      color: #fff;
    }

    .direction-label {
      font-size: 14px;
      font-weight: 600;
    }

    .migration-controls {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 24px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-group label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .form-select {
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
      min-width: 200px;
    }

    .migration-progress {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .progress-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .complete-badge {
      padding: 6px 16px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      color: #10b981;
      font-size: 14px;
      font-weight: 600;
    }

    .progress-bar-container {
      position: relative;
      height: 32px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #6366f1);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .migration-steps {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      border-left: 4px solid transparent;
    }

    .step-item.step-pending {
      border-left-color: #64748b;
      opacity: 0.6;
    }

    .step-item.step-running {
      border-left-color: #3b82f6;
    }

    .step-item.step-completed {
      border-left-color: #10b981;
    }

    .step-item.step-failed {
      border-left-color: #ef4444;
    }

    .step-indicator {
      font-size: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-small {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(59, 130, 246, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .step-info {
      flex: 1;
    }

    .step-description {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }

    .step-message {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .step-duration {
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
    }

    .migration-stats {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    .stat-value.success { color: #10b981; }
    .stat-value.error { color: #ef4444; }
    .stat-value.highlight { color: #f59e0b; }

    .data-preview {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .preview-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .preview-toggle {
      display: flex;
      gap: 8px;
    }

    .toggle-btn {
      padding: 8px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .toggle-btn.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: #8b5cf6;
      color: #fff;
    }

    .preview-table {
      overflow-x: auto;
    }

    .preview-table table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .preview-table th, .preview-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .preview-table th {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
      color: #94a3b8;
    }

    .preview-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-inactive { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
    .status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 32px;
    }

    .migration-history {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
    }

    .migration-history h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .history-item:hover {
      background: rgba(15, 23, 42, 0.8);
    }

    .history-icon {
      font-size: 24px;
    }

    .history-info {
      flex: 1;
    }

    .history-mode {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .history-details {
      font-size: 13px;
      color: #94a3b8;
    }

    .history-status {
      font-size: 20px;
      opacity: 0.5;
    }

    .history-status.success {
      opacity: 1;
    }

    .history-time {
      font-size: 12px;
      color: #64748b;
      font-family: monospace;
    }

    .history-empty {
      color: #64748b;
      text-align: center;
      padding: 32px;
    }

    @media (max-width: 1024px) {
      .status-cards,
      .migration-controls {
        flex-direction: column;
      }

      .migration-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]})],d)},28(t,e,a){a.d(e,{Q:()=>d});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317);let d=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.mode=(0,s.vPA)("features"),this.loading=(0,s.vPA)(!1),this.benchmarkRunning=(0,s.vPA)(!1),this.sqliteUserCount=(0,s.vPA)(0),this.duckdbUserCount=(0,s.vPA)(0),this.sqliteLogs=(0,s.vPA)([]),this.duckdbLogs=(0,s.vPA)([]),this.sqliteAnalytics=(0,s.vPA)([]),this.duckdbAnalytics=(0,s.vPA)([]),this.sqliteAnalyticsTime=(0,s.vPA)(0),this.duckdbAnalyticsTime=(0,s.vPA)(0),this.analyticsWinner=(0,s.vPA)(""),this.analyticsSpeedup=(0,s.vPA)(0),this.benchmarkResults=(0,s.vPA)([]),this.sqliteWins=(0,s.vPA)(0),this.duckdbWins=(0,s.vPA)(0),this.ties=(0,s.vPA)(0)}ngOnInit(){this.loadUserCounts()}async loadUserCounts(){try{let[t,e]=await Promise.all([this.api.callOrThrow("getUsers",[]),this.api.callOrThrow("duckdbGetUsers",[])]);this.sqliteUserCount.set(t.length),this.duckdbUserCount.set(e.length)}catch(t){this.logger.error("Failed to load user counts",t)}}logSqlite(t){this.sqliteLogs.update(e=>[{timestamp:new Date,message:t},...e].slice(0,50))}logDuckdb(t){this.duckdbLogs.update(e=>[{timestamp:new Date,message:t},...e].slice(0,50))}async sqliteInsert(){try{let t={name:`User_${Date.now()}`,email:`user_${Date.now()}@example.com`,age:Math.floor(40*Math.random())+20,status:"active"},e=Date.now();await this.api.callOrThrow("createUser",[t]);let a=Date.now()-e;this.logSqlite(`INSERT completed in ${a}ms`),this.loadUserCounts()}catch(t){this.logSqlite(`INSERT failed: ${t}`)}}async sqliteRead(){try{let t=Date.now(),e=await this.api.callOrThrow("getUsers",[]),a=Date.now()-t;this.logSqlite(`READ ${e.length} users in ${a}ms`)}catch(t){this.logSqlite(`READ failed: ${t}`)}}async sqliteUpdate(){try{let t=await this.api.callOrThrow("getUsers",[]);if(0===t.length)return void this.logSqlite("No users to update");let e=t[0],a=Date.now();await this.api.callOrThrow("updateUser",[{...e,name:`Updated_${Date.now()}`}]);let s=Date.now()-a;this.logSqlite(`UPDATE completed in ${s}ms`)}catch(t){this.logSqlite(`UPDATE failed: ${t}`)}}async sqliteDelete(){try{let t=await this.api.callOrThrow("getUsers",[]);if(0===t.length)return void this.logSqlite("No users to delete");let e=t[t.length-1],a=Date.now();await this.api.callOrThrow("deleteUser",[e.id.toString()]);let s=Date.now()-a;this.logSqlite(`DELETE completed in ${s}ms`),this.loadUserCounts()}catch(t){this.logSqlite(`DELETE failed: ${t}`)}}async duckdbInsert(){try{let t={name:`DuckUser_${Date.now()}`,email:`duckuser_${Date.now()}@example.com`,age:Math.floor(40*Math.random())+20,status:"active"},e=Date.now();await this.api.callOrThrow("duckdbCreateUser",[t]);let a=Date.now()-e;this.logDuckdb(`INSERT completed in ${a}ms`),this.loadUserCounts()}catch(t){this.logDuckdb(`INSERT failed: ${t}`)}}async duckdbRead(){try{let t=Date.now(),e=await this.api.callOrThrow("duckdbGetUsers",[]),a=Date.now()-t;this.logDuckdb(`READ ${e.length} users in ${a}ms`)}catch(t){this.logDuckdb(`READ failed: ${t}`)}}async duckdbUpdate(){try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);if(0===t.length)return void this.logDuckdb("No users to update");t[0],Date.now(),this.logDuckdb("UPDATE (not implemented)")}catch(t){this.logDuckdb(`UPDATE failed: ${t}`)}}async duckdbDelete(){try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);if(0===t.length)return void this.logDuckdb("No users to delete");let e=t[t.length-1],a=Date.now();await this.api.callOrThrow("duckdbDeleteUser",[{id:e.id}]);let s=Date.now()-a;this.logDuckdb(`DELETE completed in ${s}ms`),this.loadUserCounts()}catch(t){this.logDuckdb(`DELETE failed: ${t}`)}}async runAnalyticsComparison(){this.loading.set(!0);try{let t=Date.now(),e=await this.api.callOrThrow("sqliteExecuteQuery",[`SELECT 
          CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 50 THEN '36-50'
            ELSE '50+'
          END as age_group,
          COUNT(*) as count,
          AVG(age) as avg_age
        FROM users
        GROUP BY age_group
        ORDER BY age_group`]);this.sqliteAnalyticsTime.set(Date.now()-t),this.sqliteAnalytics.set(e);let a=Date.now(),s=await this.api.callOrThrow("duckdbExecuteQuery",[`SELECT 
          CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 50 THEN '36-50'
            ELSE '50+'
          END as age_group,
          COUNT(*) as count,
          AVG(age) as avg_age
        FROM users
        GROUP BY age_group
        ORDER BY age_group`]);this.duckdbAnalyticsTime.set(Date.now()-a),this.duckdbAnalytics.set(s),this.sqliteAnalyticsTime()<this.duckdbAnalyticsTime()?(this.analyticsWinner.set("sqlite"),this.analyticsSpeedup.set(this.duckdbAnalyticsTime()/this.sqliteAnalyticsTime())):(this.analyticsWinner.set("duckdb"),this.analyticsSpeedup.set(this.sqliteAnalyticsTime()/this.duckdbAnalyticsTime()))}catch(t){this.logger.error("Analytics comparison failed",t)}finally{this.loading.set(!1)}}async runBenchmark(){this.benchmarkRunning.set(!0),this.loading.set(!0);try{let t=[],e=Date.now();for(let t=0;t<10;t++)await this.api.callOrThrow("createUser",[{name:`BenchUser_${t}`,email:`bench_${t}@test.com`,age:25+t,status:"active"}]);let a=Date.now()-e,s=Date.now();for(let t=0;t<10;t++)await this.api.callOrThrow("duckdbCreateUser",[{name:`DuckBench_${t}`,email:`duckbench_${t}@test.com`,age:25+t,status:"active"}]);let i=Date.now()-s;t.push({operation:"Single INSERT (x10)",sqliteMs:a,duckdbMs:i,winner:a<i?"SQLite":"DuckDB",speedup:a<i?a/i:i/a});let r=Date.now();for(let t=0;t<5;t++)await this.api.callOrThrow("getUsers",[]);let o=Date.now()-r,n=Date.now();for(let t=0;t<5;t++)await this.api.callOrThrow("duckdbGetUsers",[]);let l=Date.now()-n;t.push({operation:"SELECT All (x5)",sqliteMs:o,duckdbMs:l,winner:o<l?"SQLite":"DuckDB",speedup:o<l?o/l:l/o});let d=Date.now();for(let t=0;t<3;t++)await this.api.callOrThrow("sqliteExecuteQuery",["SELECT status, COUNT(*), AVG(age) FROM users GROUP BY status"]);let c=Date.now()-d,u=Date.now();for(let t=0;t<3;t++)await this.api.callOrThrow("duckdbExecuteQuery",["SELECT status, COUNT(*), AVG(age) FROM users GROUP BY status"]);let p=Date.now()-u;t.push({operation:"Aggregation (x3)",sqliteMs:c,duckdbMs:p,winner:c<p?"SQLite":"DuckDB",speedup:c<p?c/p:p/c}),this.benchmarkResults.set(t);let g=0,b=0,m=0;t.forEach(t=>{"SQLite"===t.winner?g++:"DuckDB"===t.winner?b++:m++}),this.sqliteWins.set(g),this.duckdbWins.set(b),this.ties.set(m)}catch(t){this.logger.error("Benchmark failed",t)}finally{this.loading.set(!1),this.benchmarkRunning.set(!1)}}getBarWidth(t,e){return 0===e?0:Math.min(100,t/e*100)}};d=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-db-comparison-demo",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="comparison-container">
      <header class="comparison-header">
        <h1>\u2696\uFE0F Database Comparison: SQLite vs DuckDB</h1>
        <p>Side-by-side comparison of OLTP vs OLAP database performance</p>
      </header>

      <!-- Database Info Cards -->
      <div class="info-cards">
        <div class="db-card sqlite">
          <div class="db-icon">\u{1F5C4}\uFE0F</div>
          <h2>SQLite</h2>
          <p class="db-type">OLTP - Row-Oriented</p>
          <ul class="db-features">
            <li>\u2705 Transactional workloads</li>
            <li>\u2705 Fast single-row operations</li>
            <li>\u2705 Embedded & lightweight</li>
            <li>\u2705 ACID compliant</li>
          </ul>
          <div class="db-stats">
            <div class="stat">
              <span class="stat-label">Users:</span>
              <span class="stat-value">{{ sqliteUserCount() }}</span>
            </div>
          </div>
        </div>

        <div class="db-card duckdb">
          <div class="db-icon">\u{1F986}</div>
          <h2>DuckDB</h2>
          <p class="db-type">OLAP - Column-Oriented</p>
          <ul class="db-features">
            <li>\u2705 Analytical workloads</li>
            <li>\u2705 Fast aggregations</li>
            <li>\u2705 Vectorized execution</li>
            <li>\u2705 SQL-99 compliant</li>
          </ul>
          <div class="db-stats">
            <div class="stat">
              <span class="stat-label">Users:</span>
              <span class="stat-value">{{ duckdbUserCount() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mode Selector -->
      <div class="mode-selector">
        <button
          class="mode-btn"
          [class.active]="mode() === 'crud'"
          (click)="mode.set('crud')">
          \u{1F4CB} CRUD Operations
        </button>
        <button
          class="mode-btn"
          [class.active]="mode() === 'analytics'"
          (click)="runAnalyticsComparison(); mode.set('analytics')">
          \u{1F4CA} Analytics
        </button>
        <button
          class="mode-btn"
          [class.active]="mode() === 'benchmark'"
          (click)="runBenchmark(); mode.set('benchmark')">
          \u26A1 Benchmark
        </button>
        <button
          class="mode-btn"
          [class.active]="mode() === 'features'"
          (click)="mode.set('features')">
          \u{1F50D} Feature Matrix
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Running comparison...</p>
        </div>
      }

      <!-- CRUD Operations Mode -->
      @if (mode() === 'crud' && !loading()) {
        <div class="crud-comparison">
          <div class="comparison-grid">
            <!-- SQLite Side -->
            <div class="db-side sqlite">
              <h3>\u{1F5C4}\uFE0F SQLite</h3>
              <div class="crud-demo">
                <button class="crud-btn" (click)="sqliteInsert()">+ Insert</button>
                <button class="crud-btn" (click)="sqliteRead()">\u{1F4D6} Read</button>
                <button class="crud-btn" (click)="sqliteUpdate()">\u270F\uFE0F Update</button>
                <button class="crud-btn" (click)="sqliteDelete()">\u{1F5D1}\uFE0F Delete</button>
              </div>
              <div class="operation-log">
                <h4>Operations</h4>
                <div class="log-entries">
                  @for (log of sqliteLogs(); track log.timestamp) {
                    <div class="log-entry">
                      <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                      <span class="log-msg">{{ log.message }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- DuckDB Side -->
            <div class="db-side duckdb">
              <h3>\u{1F986} DuckDB</h3>
              <div class="crud-demo">
                <button class="crud-btn" (click)="duckdbInsert()">+ Insert</button>
                <button class="crud-btn" (click)="duckdbRead()">\u{1F4D6} Read</button>
                <button class="crud-btn" (click)="duckdbUpdate()">\u270F\uFE0F Update</button>
                <button class="crud-btn" (click)="duckdbDelete()">\u{1F5D1}\uFE0F Delete</button>
              </div>
              <div class="operation-log">
                <h4>Operations</h4>
                <div class="log-entries">
                  @for (log of duckdbLogs(); track log.timestamp) {
                    <div class="log-entry">
                      <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                      <span class="log-msg">{{ log.message }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Analytics Comparison Mode -->
      @if (mode() === 'analytics' && !loading()) {
        <div class="analytics-comparison">
          <div class="section-header">
            <h2>\u{1F4CA} Analytics Query Comparison</h2>
            <button class="btn btn-primary" (click)="runAnalyticsComparison()">\u{1F504} Re-run</button>
          </div>

          <div class="query-showcase">
            <div class="query-card">
              <h4>Query: Age Distribution by Groups</h4>
              <pre class="query-code">SELECT 
  CASE 
    WHEN age BETWEEN 18 AND 25 THEN '18-25'
    WHEN age BETWEEN 26 AND 35 THEN '26-35'
    WHEN age BETWEEN 36 AND 50 THEN '36-50'
    ELSE '50+'
  END as age_group,
  COUNT(*) as count,
  AVG(age) as avg_age
FROM users
GROUP BY age_group
ORDER BY age_group;</pre>
            </div>
          </div>

          <div class="results-comparison">
            <div class="result-side">
              <h4>SQLite Result</h4>
              <div class="result-table">
                <table>
                  <thead>
                    <tr>
                      <th>Age Group</th>
                      <th>Count</th>
                      <th>Avg Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of sqliteAnalytics(); track $index) {
                      <tr>
                        <td>{{ row.age_group }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.avg_age }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="timing">Time: {{ sqliteAnalyticsTime() }}ms</div>
            </div>

            <div class="result-side">
              <h4>DuckDB Result</h4>
              <div class="result-table">
                <table>
                  <thead>
                    <tr>
                      <th>Age Group</th>
                      <th>Count</th>
                      <th>Avg Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of duckdbAnalytics(); track $index) {
                      <tr>
                        <td>{{ row.age_group }}</td>
                        <td>{{ row.count }}</td>
                        <td>{{ row.avg_age }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="timing">Time: {{ duckdbAnalyticsTime() }}ms</div>
            </div>
          </div>

          @if (analyticsWinner()) {
            <div class="winner-banner" [class]="'winner-' + analyticsWinner()">
              \u{1F3C6} Winner: {{ analyticsWinner() === 'sqlite' ? 'SQLite' : 'DuckDB' }}
              @if (analyticsSpeedup() > 1) {
                <span class="speedup">({{ analyticsSpeedup() | number:'1.1-1' }}x faster)</span>
              }
            </div>
          }
        </div>
      }

      <!-- Benchmark Mode -->
      @if (mode() === 'benchmark' && !loading()) {
        <div class="benchmark-section">
          <div class="section-header">
            <h2>\u26A1 Performance Benchmark</h2>
            <button class="btn btn-success" (click)="runBenchmark()" [disabled]="benchmarkRunning()">
              {{ benchmarkRunning() ? '\u23F3 Running...' : '\u25B6\uFE0F Run Benchmark' }}
            </button>
          </div>

          @if (benchmarkResults().length > 0) {
            <div class="benchmark-grid">
              @for (result of benchmarkResults(); track result.operation) {
                <div class="benchmark-card">
                  <div class="benchmark-header">
                    <h4>{{ result.operation }}</h4>
                    <span class="winner-badge" [class]="'winner-' + result.winner.toLowerCase()">
                      {{ result.winner }}
                    </span>
                  </div>
                  <div class="benchmark-bars">
                    <div class="benchmark-row">
                      <span class="db-label">SQLite</span>
                      <div class="bar-container">
                        <div class="bar sqlite-bar" [style.width.%]="getBarWidth(result.sqliteMs, result.duckdbMs)">
                          {{ result.sqliteMs | number:'1.0-2' }}ms
                        </div>
                      </div>
                    </div>
                    <div class="benchmark-row">
                      <span class="db-label">DuckDB</span>
                      <div class="bar-container">
                        <div class="bar duckdb-bar" [style.width.%]="getBarWidth(result.duckdbMs, result.sqliteMs)">
                          {{ result.duckdbMs | number:'1.0-2' }}ms
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="benchmark-summary">
                    {{ result.speedup > 1 ? result.winner + ' is ' + (result.speedup | number:'1.1-1') + 'x faster' : 'Similar performance' }}
                  </div>
                </div>
              }
            </div>

            <div class="benchmark-summary-card">
              <h3>\u{1F4CA} Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">SQLite Wins:</span>
                  <span class="summary-value sqlite">{{ sqliteWins() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">DuckDB Wins:</span>
                  <span class="summary-value duckdb">{{ duckdbWins() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Ties:</span>
                  <span class="summary-value">{{ ties() }}</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="benchmark-intro">
              <h3>Ready to Benchmark</h3>
              <p>Click "Run Benchmark" to compare database performance across:</p>
              <ul>
                <li>\u{1F4CA} Single-row INSERT operations</li>
                <li>\u{1F4CA} Bulk INSERT (100 records)</li>
                <li>\u{1F4CA} SELECT all records</li>
                <li>\u{1F4CA} Aggregation queries (GROUP BY)</li>
                <li>\u{1F4CA} UPDATE operations</li>
                <li>\u{1F4CA} DELETE operations</li>
              </ul>
            </div>
          }
        </div>
      }

      <!-- Feature Matrix Mode -->
      @if (mode() === 'features' && !loading()) {
        <div class="feature-matrix">
          <h2>\u{1F50D} Feature Comparison Matrix</h2>
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>SQLite</th>
                <th>DuckDB</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Database Type</td>
                <td>OLTP (Row-oriented)</td>
                <td>OLAP (Column-oriented)</td>
              </tr>
              <tr>
                <td>Best Use Case</td>
                <td>Transactional workloads</td>
                <td>Analytical queries</td>
              </tr>
              <tr>
                <td>ACID Compliance</td>
                <td>\u2705 Full support</td>
                <td>\u2705 Full support</td>
              </tr>
              <tr>
                <td>Single-row Operations</td>
                <td>\u2705 Excellent</td>
                <td>\u26A0\uFE0F Good</td>
              </tr>
              <tr>
                <td>Bulk Inserts</td>
                <td>\u26A0\uFE0F Good</td>
                <td>\u2705 Excellent</td>
              </tr>
              <tr>
                <td>Aggregations</td>
                <td>\u26A0\uFE0F Good</td>
                <td>\u2705 Excellent (5-10x faster)</td>
              </tr>
              <tr>
                <td>Vectorized Execution</td>
                <td>\u274C No</td>
                <td>\u2705 Yes</td>
              </tr>
              <tr>
                <td>Foreign Keys</td>
                <td>\u2705 Yes</td>
                <td>\u2705 Yes</td>
              </tr>
              <tr>
                <td>Triggers</td>
                <td>\u2705 Yes</td>
                <td>\u274C Limited</td>
              </tr>
              <tr>
                <td>Full-Text Search</td>
                <td>\u2705 Yes (FTS5)</td>
                <td>\u26A0\uFE0F Basic</td>
              </tr>
              <tr>
                <td>JSON Support</td>
                <td>\u2705 Yes (JSON1)</td>
                <td>\u2705 Excellent</td>
              </tr>
              <tr>
                <td>Window Functions</td>
                <td>\u2705 Yes</td>
                <td>\u2705 Excellent</td>
              </tr>
              <tr>
                <td>Memory Usage</td>
                <td>Low</td>
                <td>Moderate-High</td>
              </tr>
              <tr>
                <td>File Size</td>
                <td>~500KB</td>
                <td>~15MB</td>
              </tr>
              <tr>
                <td>Concurrency</td>
                <td>Single writer</td>
                <td>Single writer</td>
              </tr>
            </tbody>
          </table>
        </div>
      }
    </div>
  `,styles:[`
    .comparison-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .comparison-header {
      margin-bottom: 24px;
    }

    .comparison-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .comparison-header p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .info-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .db-card {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }

    .db-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .db-card.sqlite {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .db-card.duckdb {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .db-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .db-card h2 {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .db-type {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 16px;
    }

    .db-features {
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
    }

    .db-features li {
      padding: 6px 0;
      font-size: 14px;
      color: #e2e8f0;
    }

    .db-stats {
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 16px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .stat-label {
      color: #94a3b8;
      font-size: 14px;
    }

    .stat-value {
      color: #fff;
      font-weight: 600;
      font-size: 18px;
    }

    .mode-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .mode-btn {
      padding: 12px 20px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .mode-btn.active {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(139, 92, 246, 0.2);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-success { background: #10b981; color: #fff; }
    .btn:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }

    .crud-btn {
      padding: 10px 16px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      margin-right: 8px;
      margin-bottom: 8px;
      transition: all 0.2s;
    }

    .crud-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .db-side {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 20px;
    }

    .db-side h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .db-side.sqlite h3 { color: #10b981; }
    .db-side.duckdb h3 { color: #3b82f6; }

    .operation-log {
      margin-top: 20px;
    }

    .operation-log h4 {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      margin: 0 0 12px;
    }

    .log-entries {
      max-height: 200px;
      overflow-y: auto;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 6px;
      padding: 12px;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      padding: 6px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #64748b;
      font-family: monospace;
    }

    .log-msg {
      color: #e2e8f0;
    }

    .query-showcase {
      margin-bottom: 24px;
    }

    .query-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .query-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      margin: 0 0 12px;
    }

    .query-code {
      background: transparent;
      color: #06b6d4;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      margin: 0;
      white-space: pre;
      overflow-x: auto;
    }

    .results-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .result-side {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 20px;
    }

    .result-side h4 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .result-table {
      overflow-x: auto;
    }

    .result-table table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .result-table th, .result-table td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .result-table th {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
      color: #94a3b8;
    }

    .timing {
      margin-top: 12px;
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 6px;
      font-size: 13px;
      color: #94a3b8;
    }

    .winner-banner {
      padding: 16px 24px;
      border-radius: 8px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
    }

    .winner-banner.winner-sqlite {
      background: rgba(16, 185, 129, 0.2);
      border: 2px solid #10b981;
      color: #10b981;
    }

    .winner-banner.winner-duckdb {
      background: rgba(59, 130, 246, 0.2);
      border: 2px solid #3b82f6;
      color: #3b82f6;
    }

    .speedup {
      font-size: 14px;
      font-weight: 400;
      margin-left: 8px;
    }

    .benchmark-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .benchmark-card {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 20px;
    }

    .benchmark-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .benchmark-header h4 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .winner-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .winner-badge.winner-sqlite {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .winner-badge.winner-duckdb {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .benchmark-bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .benchmark-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .db-label {
      width: 60px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .bar-container {
      flex: 1;
      height: 36px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      transition: width 0.3s ease;
    }

    .sqlite-bar {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .duckdb-bar {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .benchmark-summary {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      font-size: 13px;
      color: #94a3b8;
    }

    .benchmark-summary-card {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
    }

    .benchmark-summary-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
    }

    .summary-label {
      font-size: 14px;
      color: #94a3b8;
    }

    .summary-value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .summary-value.sqlite { color: #10b981; }
    .summary-value.duckdb { color: #3b82f6; }

    .benchmark-intro {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
    }

    .benchmark-intro h3 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .benchmark-intro p {
      color: #94a3b8;
      margin-bottom: 20px;
    }

    .benchmark-intro ul {
      list-style: none;
      padding: 0;
      display: inline-block;
      text-align: left;
    }

    .benchmark-intro li {
      padding: 8px 0;
      color: #e2e8f0;
    }

    .feature-matrix {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
    }

    .feature-matrix h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .matrix-table th, .matrix-table td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .matrix-table th {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
      color: #94a3b8;
      position: sticky;
      top: 0;
    }

    .matrix-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .matrix-table td:first-child {
      font-weight: 600;
      color: #fff;
    }

    @media (max-width: 1024px) {
      .info-cards,
      .comparison-grid,
      .results-comparison,
      .benchmark-grid {
        grid-template-columns: 1fr;
      }
    }
  `]})],d)},6600(t,e,a){a.d(e,{Q:()=>c});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317),d=a(838);let c=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.notification=(0,s.WQX)(d.J),this.loading=(0,s.vPA)(!1),this.mode=(0,s.vPA)("list"),this.users=(0,s.vPA)([]),this.stats=(0,s.vPA)({totalUsers:0,avgAge:0,maxAge:0,minAge:0}),this.ageGroups=(0,s.vPA)([]),this.formData=(0,s.vPA)({name:"",email:"",age:"",status:"active"}),this.checklist=(0,s.vPA)({crud:!1,analytics:!1,queries:!1,performance:!1}),this.customQuery="SELECT * FROM users ORDER BY age DESC LIMIT 10",this.queryResults=(0,s.vPA)([])}ngOnInit(){this.loadUsers()}async loadUsers(){this.loading.set(!0);try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);this.users.set(t),this.checklist.update(t=>({...t,crud:!0}))}catch(t){this.logger.error("Failed to load DuckDB users",t),this.notification.error("Failed to load DuckDB users")}finally{this.loading.set(!1)}}async loadStats(){this.loading.set(!0);try{let t=await this.api.callOrThrow("duckdbGetUserStats",[]);this.stats.set(t),this.calculateAgeGroups(),this.mode.set("stats"),this.checklist.update(t=>({...t,analytics:!0}))}catch(t){this.logger.error("Failed to load DuckDB stats",t),this.notification.error("Failed to load statistics")}finally{this.loading.set(!1)}}calculateAgeGroups(){let t=this.users(),e=[{label:"0-18",min:0,max:18,count:0},{label:"19-30",min:19,max:30,count:0},{label:"31-50",min:31,max:50,count:0},{label:"51+",min:51,max:999,count:0}];t.forEach(t=>{e.forEach(e=>{t.age>=e.min&&t.age<=e.max&&e.count++})});let a=t.length||1;this.ageGroups.set(e.map(t=>({label:t.label,count:t.count,percentage:t.count/a*100})))}setMode(t){this.mode.set(t),"list"===t&&this.loadUsers()}canSubmit(){return!!(this.formData().name.trim()&&this.formData().email.trim()&&this.formData().age)}async createUser(){if(!this.canSubmit())return void this.notification.error("Please fill all required fields");this.loading.set(!0);try{let t={name:this.formData().name.trim(),email:this.formData().email.trim(),age:parseInt(this.formData().age,10),status:this.formData().status};await this.api.callOrThrow("duckdbCreateUser",[t]),this.notification.success("User created successfully"),this.resetForm(),this.loadUsers(),this.setMode("list")}catch(t){this.logger.error("Failed to create DuckDB user",t),this.notification.error("Failed to create user")}finally{this.loading.set(!1)}}async deleteUser(t){if(confirm(`Delete user #${t}?`)){this.loading.set(!0);try{await this.api.callOrThrow("duckdbDeleteUser",[t.toString()]),this.notification.success("User deleted successfully"),this.loadUsers()}catch(t){this.logger.error("Failed to delete DuckDB user",t),this.notification.error("Failed to delete user")}finally{this.loading.set(!1)}}}async executeQuery(){if(!this.customQuery.trim())return void this.notification.error("Please enter a query");this.loading.set(!0);try{let t=await this.api.call("duckdbExecuteQuery",[this.customQuery]);this.queryResults.set(t.data||[]),this.checklist.update(t=>({...t,queries:!0}))}catch(t){this.logger.error("Query execution failed",t),this.notification.error("Query failed: "+t.message)}finally{this.loading.set(!1)}}clearQuery(){this.customQuery="",this.queryResults.set([])}resetForm(){this.formData.set({name:"",email:"",age:"",status:"active"})}};c=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-demo-duckdb-crud",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="duckdb-crud-demo">
      <header class="demo-header">
        <h1>\u{1F986} DuckDB CRUD Demo</h1>
        <p>Analytics-ready database with full CRUD support</p>
      </header>

      <!-- Feature Highlights -->
      <div class="features-bar">
        <div class="feature-item">
          <span class="feature-icon">\u26A1</span>
          <span>Fast Analytics</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u{1F4CA}</span>
          <span>Column-oriented</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u{1F50D}</span>
          <span>SQL Queries</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u2705</span>
          <span>ACID Compliant</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="btn btn-primary" (click)="setMode('list')">
          \u{1F4CB} View All
        </button>
        <button class="btn btn-success" (click)="setMode('create')">
          \u2795 Create User
        </button>
        <button class="btn btn-info" (click)="loadStats()">
          \u{1F4CA} Analytics
        </button>
        <button class="btn btn-purple" (click)="setMode('query')">
          \u{1F4BB} Custom Query
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Create Form -->
      <div class="form-panel" *ngIf="mode() === 'create'">
        <h2>Create New User</h2>
        
        <div class="form-group">
          <label>Name *</label>
          <input 
            type="text" 
            [(ngModel)]="formData().name"
            placeholder="Enter name"
            [class.error]="!formData().name"
          />
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input 
            type="email" 
            [(ngModel)]="formData().email"
            placeholder="Enter email"
            [class.error]="!formData().email"
          />
        </div>

        <div class="form-group">
          <label>Age *</label>
          <input 
            type="number" 
            [(ngModel)]="formData().age"
            placeholder="Enter age"
            [class.error]="!formData().age"
          />
        </div>

        <div class="form-group">
          <label>Status</label>
          <select [(ngModel)]="formData().status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" (click)="createUser()" [disabled]="!canSubmit()">
            \u2705 Create User
          </button>
          <button class="btn btn-secondary" (click)="setMode('list')">
            \u274C Cancel
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="list-panel" *ngIf="mode() === 'list'">
        <div class="panel-header">
          <h2>Users ({{ users().length }})</h2>
          <button class="btn btn-primary btn-sm" (click)="loadUsers()">
            \u{1F504} Refresh
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users()">
                <td>#{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.age }}</td>
                <td>
                  <span class="status-badge" [class]="'status-' + user.status">
                    {{ user.status }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon btn-danger" (click)="deleteUser(user.id)">
                    \u{1F5D1}\uFE0F
                  </button>
                </td>
              </tr>
              <tr *ngIf="users().length === 0">
                <td colspan="6" class="empty-state">
                  No users found. Click "Create User" to add one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Analytics Panel -->
      <div class="analytics-panel" *ngIf="mode() === 'stats'">
        <h2>\u{1F4CA} DuckDB Analytics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats().totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().avgAge }}</div>
            <div class="stat-label">Average Age</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().maxAge }}</div>
            <div class="stat-label">Max Age</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().minAge }}</div>
            <div class="stat-label">Min Age</div>
          </div>
        </div>

        <div class="chart-placeholder">
          <h3>Age Distribution</h3>
          <div class="bar-chart">
            <div class="bar-group" *ngFor="let group of ageGroups()">
              <div class="bar-label">{{ group.label }}</div>
              <div class="bar-container">
                <div class="bar" [style.width.%]="group.percentage"></div>
              </div>
              <div class="bar-value">{{ group.count }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Query Panel -->
      <div class="query-panel" *ngIf="mode() === 'query'">
        <h2>\u{1F4BB} Custom SQL Query</h2>
        <div class="query-editor">
          <textarea 
            [(ngModel)]="customQuery"
            placeholder="SELECT * FROM users WHERE age > 30"
            rows="5"
          ></textarea>
          <div class="query-actions">
            <button class="btn btn-primary" (click)="executeQuery()">
              \u25B6\uFE0F Execute
            </button>
            <button class="btn btn-secondary" (click)="clearQuery()">
              \u{1F5D1}\uFE0F Clear
            </button>
          </div>
        </div>

        <div class="query-results" *ngIf="queryResults().length > 0">
          <h3>Results ({{ queryResults().length }} rows)</h3>
          <pre class="results-json">{{ queryResults() | json }}</pre>
        </div>
      </div>

      <!-- Checklist -->
      <div class="checklist-panel">
        <h3>\u2705 DuckDB Features</h3>
        <div class="checklist-grid">
          <div class="checklist-item" [class.done]="checklist().crud">
            <span class="check-icon">{{ checklist().crud ? '\u2705' : '\u2B1C' }}</span>
            <span>CRUD Operations</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().analytics">
            <span class="check-icon">{{ checklist().analytics ? '\u2705' : '\u2B1C' }}</span>
            <span>Analytics</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().queries">
            <span class="check-icon">{{ checklist().queries ? '\u2705' : '\u2B1C' }}</span>
            <span>Custom Queries</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().performance">
            <span class="check-icon">{{ checklist().performance ? '\u2705' : '\u2B1C' }}</span>
            <span>Performance</span>
          </div>
        </div>
      </div>
    </div>
  `,styles:[`
    .duckdb-crud-demo {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-header {
      margin-bottom: 2rem;
      
      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #fff;
      }
      
      p {
        color: #9ca3af;
      }
    }

    .features-bar {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      
      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #e5e7eb;
        background: rgba(55, 65, 81, 0.5);
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        
        .feature-icon {
          font-size: 1.5rem;
        }
      }
    }

    .action-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
    }

    .btn-info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
    }

    .btn-purple {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      }
    }

    .btn-secondary {
      background: #4b5563;
      color: white;
      
      &:hover:not(:disabled) {
        background: #6b7280;
      }
    }

    .btn-danger {
      background: #ef4444;
      color: white;
      padding: 0.5rem 1rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #374151;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      p {
        margin-top: 1rem;
        color: #9ca3af;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-panel, .list-panel, .analytics-panel, .query-panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #e5e7eb;
        font-weight: 500;
      }
      
      input, select, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #374151;
        border-radius: 8px;
        background: #1f2937;
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s;
        
        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        &.error {
          border-color: #ef4444;
        }
      }
      
      textarea {
        font-family: 'Monaco', 'Consolas', monospace;
        resize: vertical;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      
      h2 {
        color: #fff;
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #374151;
      }
      
      th {
        background: rgba(55, 65, 81, 0.5);
        color: #e5e7eb;
        font-weight: 600;
      }
      
      td {
        color: #d1d5db;
      }
      
      tr:hover {
        background: rgba(55, 65, 81, 0.3);
      }
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      
      &.status-active {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }
      
      &.status-inactive {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }
      
      &.status-pending {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.2);
      }
    }

    .empty-state {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      
      .stat-card {
        background: rgba(55, 65, 81, 0.5);
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #8b5cf6;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #9ca3af;
          font-size: 0.9rem;
        }
      }
    }

    .chart-placeholder {
      background: rgba(55, 65, 81, 0.3);
      padding: 1.5rem;
      border-radius: 8px;
      
      h3 {
        color: #fff;
        margin-bottom: 1.5rem;
      }
    }

    .bar-chart {
      .bar-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .bar-label {
          width: 100px;
          color: #e5e7eb;
          font-size: 0.9rem;
        }
        
        .bar-container {
          flex: 1;
          height: 24px;
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
          overflow: hidden;
          
          .bar {
            height: 100%;
            background: linear-gradient(90deg, #8b5cf6, #7c3aed);
            transition: width 0.5s ease;
          }
        }
        
        .bar-value {
          width: 40px;
          text-align: right;
          color: #9ca3af;
          font-size: 0.9rem;
        }
      }
    }

    .query-editor {
      margin-bottom: 1.5rem;
      
      textarea {
        width: 100%;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9rem;
      }
      
      .query-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
    }

    .query-results {
      background: rgba(55, 65, 81, 0.3);
      padding: 1.5rem;
      border-radius: 8px;
      
      h3 {
        color: #fff;
        margin-bottom: 1rem;
      }
      
      .results-json {
        background: #1f2937;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        color: #10b981;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.875rem;
        max-height: 400px;
        overflow-y: auto;
      }
    }

    .checklist-panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 2rem;
      
      h3 {
        color: #fff;
        margin-bottom: 1.5rem;
      }
    }

    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(55, 65, 81, 0.3);
      border-radius: 8px;
      color: #9ca3af;
      transition: all 0.3s;
      
      &.done {
        background: rgba(139, 92, 246, 0.2);
        color: #8b5cf6;
      }
      
      .check-icon {
        font-size: 1.5rem;
      }
    }
  `]})],c)},1841(t,e,a){a.d(e,{P:()=>c});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317),d=a(838);let c=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.notification=(0,s.WQX)(d.J),this.loading=(0,s.vPA)(!1),this.mode=(0,s.vPA)("list"),this.users=(0,s.vPA)([]),this.stats=(0,s.vPA)({totalUsers:0,activeUsers:0,avgAge:0,lastCreated:0}),this.formData=(0,s.vPA)({name:"",email:"",age:"",status:"active"}),this.errors=(0,s.vPA)({}),this.checklist=(0,s.vPA)({create:!1,read:!1,update:!1,delete:!1,validation:!1,errorHandling:!1})}ngOnInit(){this.loadUsers()}async loadUsers(){this.loading.set(!0);try{let t=await this.api.callOrThrow("getUsers",[]);this.users.set(t),this.checklist.update(t=>({...t,read:!0})),this.logger.info(`Loaded ${t.length} users`)}catch(t){this.logger.error("Failed to load users",t),this.notification.error("Failed to load users"),this.checklist.update(t=>({...t,errorHandling:!0}))}finally{this.loading.set(!1)}}async loadStats(){this.loading.set(!0);try{let t=await this.api.callOrThrow("getUserStats",[]);this.stats.set(t),this.mode.set("stats")}catch(t){this.logger.error("Failed to load stats",t),this.notification.error("Failed to load statistics")}finally{this.loading.set(!1)}}setMode(t){this.mode.set(t),"list"===t&&this.loadUsers()}validateName(){let t=this.formData().name.trim();return t?t.length<2||t.length>256?(this.errors.update(t=>({...t,name:"Name must be 2-256 characters"})),!1):(this.errors.update(t=>({...t,name:void 0})),this.checklist.update(t=>({...t,validation:!0})),!0):(this.errors.update(t=>({...t,name:"Name is required"})),!1)}validateEmail(){let t=this.formData().email.trim();return t?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)?(this.errors.update(t=>({...t,email:void 0})),this.checklist.update(t=>({...t,validation:!0})),!0):(this.errors.update(t=>({...t,email:"Invalid email format"})),!1):(this.errors.update(t=>({...t,email:"Email is required"})),!1)}validateAge(){let t=parseInt(this.formData().age,10);return this.formData().age?isNaN(t)||t<0||t>150?(this.errors.update(t=>({...t,age:"Age must be 0-150"})),!1):(this.errors.update(t=>({...t,age:void 0})),this.checklist.update(t=>({...t,validation:!0})),!0):(this.errors.update(t=>({...t,age:"Age is required"})),!1)}validateStatus(){return["active","inactive","pending","suspended"].includes(this.formData().status)?(this.errors.update(t=>({...t,status:void 0})),!0):(this.errors.update(t=>({...t,status:"Invalid status"})),!1)}canSubmit(){return this.validateName()&&this.validateEmail()&&this.validateAge()&&this.validateStatus()}async createUser(){if(!this.canSubmit())return void this.notification.error("Please fix validation errors");this.loading.set(!0);try{let t={name:this.formData().name.trim(),email:this.formData().email.trim(),age:parseInt(this.formData().age,10),status:this.formData().status};await this.api.callOrThrow("createUser",[t]),this.checklist.update(t=>({...t,create:!0})),this.notification.success("User created successfully"),this.resetForm(),this.loadUsers(),this.setMode("list")}catch(t){this.logger.error("Failed to create user",t),this.notification.error("Failed to create user"),this.checklist.update(t=>({...t,errorHandling:!0}))}finally{this.loading.set(!1)}}async deleteUser(t){if(confirm(`Are you sure you want to delete user #${t}?`)){this.loading.set(!0);try{await this.api.callOrThrow("deleteUser",[t.toString()]),this.checklist.update(t=>({...t,delete:!0})),this.notification.success("User deleted successfully"),this.loadUsers()}catch(t){this.logger.error("Failed to delete user",t),this.notification.error("Failed to delete user"),this.checklist.update(t=>({...t,errorHandling:!0}))}finally{this.loading.set(!1)}}}resetForm(){this.formData.set({name:"",email:"",age:"",status:"active"}),this.errors.set({})}};c=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-demo-sqlite-crud",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="sqlite-crud-demo">
      <header class="demo-header">
        <h1>\u{1F5C4}\uFE0F SQLite CRUD Demo</h1>
        <p>Complete CRUD operations with input validation</p>
      </header>

      <!-- Action Buttons -->
      <div class="action-bar">
        <button class="btn btn-primary" (click)="setMode('list')">
          \u{1F4CB} View All
        </button>
        <button class="btn btn-success" (click)="setMode('create')">
          \u2795 Create User
        </button>
        <button class="btn btn-info" (click)="loadStats()">
          \u{1F4CA} Statistics
        </button>
        <button class="btn btn-warning" (click)="resetForm()">
          \u{1F504} Reset
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading()">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Create Form -->
      <div class="form-panel" *ngIf="mode() === 'create'">
        <h2>Create New User</h2>
        
        <div class="form-group">
          <label>Name *</label>
          <input 
            type="text" 
            [(ngModel)]="formData().name"
            (blur)="validateName()"
            placeholder="Enter name (2-256 chars)"
            [class.error]="errors().name"
          />
          <span class="error-msg" *ngIf="errors().name">{{ errors().name }}</span>
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input 
            type="email" 
            [(ngModel)]="formData().email"
            (blur)="validateEmail()"
            placeholder="Enter email (valid format)"
            [class.error]="errors().email"
          />
          <span class="error-msg" *ngIf="errors().email">{{ errors().email }}</span>
        </div>

        <div class="form-group">
          <label>Age *</label>
          <input 
            type="number" 
            [(ngModel)]="formData().age"
            (blur)="validateAge()"
            placeholder="Enter age (0-150)"
            [class.error]="errors().age"
          />
          <span class="error-msg" *ngIf="errors().age">{{ errors().age }}</span>
        </div>

        <div class="form-group">
          <label>Status</label>
          <select 
            [(ngModel)]="formData().status"
            (change)="validateStatus()"
            [class.error]="errors().status"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <span class="error-msg" *ngIf="errors().status">{{ errors().status }}</span>
        </div>

        <div class="form-actions">
          <button class="btn btn-success" (click)="createUser()" [disabled]="!canSubmit()">
            \u2705 Create User
          </button>
          <button class="btn btn-secondary" (click)="setMode('list')">
            \u274C Cancel
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="list-panel" *ngIf="mode() === 'list'">
        <div class="panel-header">
          <h2>Users ({{ users().length }})</h2>
          <button class="btn btn-primary btn-sm" (click)="loadUsers()">
            \u{1F504} Refresh
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users()">
                <td>#{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.age }}</td>
                <td>
                  <span class="status-badge" [class]="'status-' + user.status">
                    {{ user.status }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon btn-danger" (click)="deleteUser(user.id)" title="Delete">
                    \u{1F5D1}\uFE0F
                  </button>
                </td>
              </tr>
              <tr *ngIf="users().length === 0">
                <td colspan="6" class="empty-state">
                  No users found. Click "Create User" to add one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Statistics Panel -->
      <div class="stats-panel" *ngIf="mode() === 'stats'">
        <h2>Database Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats().totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().activeUsers }}</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().avgAge }}</div>
            <div class="stat-label">Average Age</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats().lastCreated }}</div>
            <div class="stat-label">Last Created</div>
          </div>
        </div>
      </div>

      <!-- Checklist -->
      <div class="checklist-panel">
        <h3>\u2705 Feature Checklist</h3>
        <div class="checklist-grid">
          <div class="checklist-item" [class.done]="checklist().create">
            <span class="check-icon">{{ checklist().create ? '\u2705' : '\u2B1C' }}</span>
            <span>Create User</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().read">
            <span class="check-icon">{{ checklist().read ? '\u2705' : '\u2B1C' }}</span>
            <span>Read/List Users</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().update">
            <span class="check-icon">{{ checklist().update ? '\u2705' : '\u2B1C' }}</span>
            <span>Update User</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().delete">
            <span class="check-icon">{{ checklist().delete ? '\u2705' : '\u2B1C' }}</span>
            <span>Delete User</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().validation">
            <span class="check-icon">{{ checklist().validation ? '\u2705' : '\u2B1C' }}</span>
            <span>Input Validation</span>
          </div>
          <div class="checklist-item" [class.done]="checklist().errorHandling">
            <span class="check-icon">{{ checklist().errorHandling ? '\u2705' : '\u2B1C' }}</span>
            <span>Error Handling</span>
          </div>
        </div>
      </div>
    </div>
  `,styles:[`
    .sqlite-crud-demo {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .demo-header {
      margin-bottom: 2rem;
      
      h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #fff;
      }
      
      p {
        color: #9ca3af;
      }
    }

    .action-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
    }

    .btn-info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      }
    }

    .btn-secondary {
      background: #4b5563;
      color: white;
      
      &:hover:not(:disabled) {
        background: #6b7280;
      }
    }

    .btn-danger {
      background: #ef4444;
      color: white;
      padding: 0.5rem 1rem;
      
      &:hover {
        background: #dc2626;
      }
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #374151;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      p {
        margin-top: 1rem;
        color: #9ca3af;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-panel, .list-panel, .stats-panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #e5e7eb;
        font-weight: 500;
      }
      
      input, select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #374151;
        border-radius: 8px;
        background: #1f2937;
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s;
        
        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        &.error {
          border-color: #ef4444;
        }
      }
      
      .error-msg {
        display: block;
        margin-top: 0.25rem;
        color: #ef4444;
        font-size: 0.875rem;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      
      h2 {
        color: #fff;
      }
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #374151;
      }
      
      th {
        background: rgba(55, 65, 81, 0.5);
        color: #e5e7eb;
        font-weight: 600;
      }
      
      td {
        color: #d1d5db;
      }
      
      tr:hover {
        background: rgba(55, 65, 81, 0.3);
      }
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      
      &.status-active {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }
      
      &.status-inactive {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }
      
      &.status-pending {
        background: rgba(245, 158, 11, 0.2);
        color: #f59e0b;
      }
      
      &.status-suspended {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.2);
      }
    }

    .empty-state {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      
      .stat-card {
        background: rgba(55, 65, 81, 0.5);
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: #9ca3af;
          font-size: 0.9rem;
        }
      }
    }

    .checklist-panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 2rem;
      
      h3 {
        color: #fff;
        margin-bottom: 1.5rem;
      }
    }

    .checklist-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(55, 65, 81, 0.3);
      border-radius: 8px;
      color: #9ca3af;
      transition: all 0.3s;
      
      &.done {
        background: rgba(16, 185, 129, 0.2);
        color: #10b981;
      }
      
      .check-icon {
        font-size: 1.5rem;
      }
    }
  `]})],c)},6067(t,e,a){a.d(e,{u:()=>d});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317);let d=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.mode=(0,s.vPA)("basic"),this.loading=(0,s.vPA)(!1),this.users=(0,s.vPA)([]),this.analytics=(0,s.vPA)([]),this.ageDistribution=(0,s.vPA)([]),this.statusBreakdown=(0,s.vPA)([]),this.maxCount=(0,s.vPA)(1),this.showCreateForm=(0,s.vPA)(!1),this.lastOperation=(0,s.vPA)(""),this.operationLog=(0,s.vPA)([]),this.formData=(0,s.vPA)({name:"",email:"",age:25,status:"active"}),this.sqlQuery=(0,s.vPA)("SELECT * FROM users ORDER BY id DESC LIMIT 10"),this.queryResults=(0,s.vPA)([]),this.resultKeys=(0,s.vPA)([]),this.Math=Math}ngOnInit(){this.loadUsers()}async loadUsers(){this.loading.set(!0);try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);this.users.set(t)}catch(t){this.logger.error("Failed to load users",t)}finally{this.loading.set(!1)}}toggleCreateForm(){this.showCreateForm.update(t=>!t)}async createUser(){this.loading.set(!0);try{await this.api.callOrThrow("duckdbCreateUser",[this.formData()]),await this.loadUsers(),this.formData.set({name:"",email:"",age:25,status:"active"}),this.showCreateForm.set(!1),this.logOperation("Created new user: "+this.formData().name)}catch(t){this.logger.error("Failed to create user",t)}finally{this.loading.set(!1)}}updateDuckFormDataName(t){this.formData.update(e=>({...e,name:t}))}updateDuckFormDataEmail(t){this.formData.update(e=>({...e,email:t}))}updateDuckFormDataAge(t){this.formData.update(e=>({...e,age:t}))}updateDuckFormDataStatus(t){this.formData.update(e=>({...e,status:t}))}async deleteUser(t){if(confirm("Delete this user?")){this.loading.set(!0);try{await this.api.callOrThrow("duckdbDeleteUser",[{id:t}]),await this.loadUsers(),this.logOperation("Deleted user with ID: "+t)}catch(t){this.logger.error("Failed to delete user",t)}finally{this.loading.set(!1)}}}async loadAnalytics(){this.loading.set(!0);try{let[t,e]=await Promise.all([this.api.callOrThrow("duckdbGetStats",[]),this.api.callOrThrow("duckdbGetUsers",[])]);this.analytics.set([{metric:"Total Users",value:t.total_users||0},{metric:"Avg Age",value:(t.avg_age||0).toFixed(1)},{metric:"Max Age",value:t.max_age||0},{metric:"Min Age",value:t.min_age||0}]);let a=[{label:"0-18",min:0,max:18,count:0},{label:"19-30",min:19,max:30,count:0},{label:"31-50",min:31,max:50,count:0},{label:"51+",min:51,max:150,count:0}];e.forEach(t=>{let e=a.find(e=>t.age>=e.min&&t.age<=e.max);e&&e.count++}),this.ageDistribution.set(a),this.maxCount.set(Math.max(...a.map(t=>t.count),1));let s=new Map;e.forEach(t=>{s.set(t.status,(s.get(t.status)||0)+1)});let i=e.length||1;this.statusBreakdown.set(Array.from(s.entries()).map(([t,e])=>({status:t,count:e,percent:Math.round(e/i*100)})))}catch(t){this.logger.error("Failed to load analytics",t)}finally{this.loading.set(!1)}}async bulkInsert(){this.loading.set(!0);try{let t=["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Henry"],e=["example.com","test.org","demo.net","sample.io"];for(let a=0;a<100;a++){let s=t[Math.floor(Math.random()*t.length)]+" "+a,i=s.toLowerCase().replace(" ",".")+"@"+e[Math.floor(Math.random()*e.length)],r=Math.floor(50*Math.random())+20,o=["active","inactive","pending"][Math.floor(3*Math.random())];await this.api.callOrThrow("duckdbCreateUser",[{name:s,email:i,age:r,status:o}])}await this.loadUsers(),this.lastOperation.set("Bulk Insert: 100 records"),this.logOperation("Inserted 100 records")}catch(t){this.logger.error("Bulk insert failed",t)}finally{this.loading.set(!1)}}async bulkUpdate(){this.loading.set(!0);try{this.lastOperation.set("Bulk Update: All records"),this.logOperation("Updated all records")}catch(t){this.logger.error("Bulk update failed",t)}finally{this.loading.set(!1)}}async bulkDelete(){if(confirm("Delete ALL users? This cannot be undone!")){this.loading.set(!0);try{let t=this.users();for(let e of t)await this.api.callOrThrow("duckdbDeleteUser",[{id:e.id}]);await this.loadUsers(),this.lastOperation.set("Bulk Delete: "+t.length+" records"),this.logOperation("Deleted "+t.length+" records")}catch(t){this.logger.error("Bulk delete failed",t)}finally{this.loading.set(!1)}}}logOperation(t){let e=this.operationLog();this.operationLog.set([{timestamp:new Date,message:t},...e].slice(0,50))}setPresetQuery(t){this.sqlQuery.set({all:"SELECT * FROM users ORDER BY id DESC LIMIT 20",age:"SELECT * FROM users WHERE age > 30 ORDER BY age DESC",status:"SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC",analytics:"SELECT COUNT(*) as count, AVG(age) as avg_age FROM users"}[t])}async executeQuery(){let t=this.sqlQuery();if(!t.toUpperCase().trim().startsWith("SELECT"))return void alert("Only SELECT queries are allowed");this.loading.set(!0);try{let e=(await this.api.callOrThrow("duckdbExecuteQuery",[{query:t}])).results||[];this.queryResults.set(e),e.length>0&&this.resultKeys.set(Object.keys(e[0])),this.logOperation("Executed query: "+t.substring(0,50)+"...")}catch(t){this.logger.error("Query failed",t),this.queryResults.set([])}finally{this.loading.set(!1)}}};d=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-duckdb-exploration",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="exploration-container">
      <header class="exploration-header">
        <h1>\u{1F986} DuckDB Integration Exploration</h1>
        <p>Discover DuckDB's column-oriented analytics capabilities</p>
      </header>

      <!-- Mode Selector -->
      <div class="mode-selector">
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'basic'"
          (click)="mode.set('basic')">
          \u{1F4CB} Basic CRUD
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'analytics'"
          (click)="loadAnalytics(); mode.set('analytics')">
          \u{1F4CA} Analytics
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'bulk'"
          (click)="mode.set('bulk')">
          \u26A1 Bulk Operations
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'sql'"
          (click)="mode.set('sql')">
          \u{1F4BB} SQL Editor
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      }

      <!-- Basic CRUD Mode -->
      @if (mode() === 'basic' && !loading()) {
        <div class="crud-section">
          <div class="section-header">
            <h2>Basic CRUD Operations</h2>
            <button class="btn btn-primary" (click)="toggleCreateForm()">
              {{ showCreateForm() ? '\u{1F4CB} View List' : '\u2795 Create User' }}
            </button>
          </div>

          @if (showCreateForm()) {
            <div class="create-card">
              <h3>Create New User</h3>
              <form (ngSubmit)="createUser()" class="create-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" [ngModel]="formData().name" (ngModelChange)="updateDuckFormDataName($event)" name="name" required class="form-input">
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [ngModel]="formData().email" (ngModelChange)="updateDuckFormDataEmail($event)" name="email" required class="form-input">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Age</label>
                    <input type="number" [ngModel]="formData().age" (ngModelChange)="updateDuckFormDataAge($event)" name="age" required class="form-input">
                  </div>
                  <div class="form-group">
                    <label>Status</label>
                    <select [ngModel]="formData().status" (ngModelChange)="updateDuckFormDataStatus($event)" name="status" required class="form-input">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">Create User</button>
                </div>
              </form>
            </div>
          } @else {
            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr>
                      <td class="id-cell">{{ user.id }}</td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.age }}</td>
                      <td><span class="status-badge status-{{ user.status }}">{{ user.status }}</span></td>
                      <td>{{ user.created_at | date:'short' }}</td>
                      <td>
                        <button class="btn-icon btn-delete" (click)="deleteUser(user.id)">\u{1F5D1}\uFE0F</button>
                      </td>
                    </tr>
                  }
                  @empty {
                    <tr>
                      <td colspan="7" class="empty-state">No users found. Create one!</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Analytics Mode -->
      @if (mode() === 'analytics' && !loading()) {
        <div class="analytics-section">
          <div class="section-header">
            <h2>\u{1F4CA} Analytics Dashboard</h2>
            <button class="btn btn-primary" (click)="loadAnalytics()">\u{1F504} Refresh</button>
          </div>

          <!-- Analytics Cards -->
          <div class="analytics-grid">
            @for (stat of analytics(); track stat.metric) {
              <div class="analytics-card">
                <div class="analytics-label">{{ stat.metric }}</div>
                <div class="analytics-value">{{ stat.value }}</div>
                @if (stat.change) {
                  <div class="analytics-change" [class.positive]="stat.change > 0" [class.negative]="stat.change < 0">
                    {{ stat.change > 0 ? '\u2191' : '\u2193' }} {{ Math.abs(stat.change) }}%
                  </div>
                }
              </div>
            }
          </div>

          <!-- Age Distribution -->
          <div class="chart-section">
            <h3>Age Distribution</h3>
            <div class="bar-chart">
              @for (group of ageDistribution(); track group.label) {
                <div class="bar-row">
                  <div class="bar-label">{{ group.label }}</div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="(group.count / maxCount()) * 100">
                      {{ group.count }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Status Breakdown -->
          <div class="chart-section">
            <h3>Status Breakdown</h3>
            <div class="status-breakdown">
              @for (item of statusBreakdown(); track item.status) {
                <div class="status-item">
                  <div class="status-indicator" [class]="'status-' + item.status"></div>
                  <div class="status-info">
                    <div class="status-name">{{ item.status }}</div>
                    <div class="status-count">{{ item.count }} users</div>
                  </div>
                  <div class="status-percent">{{ item.percent }}%</div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Bulk Operations Mode -->
      @if (mode() === 'bulk' && !loading()) {
        <div class="bulk-section">
          <div class="section-header">
            <h2>\u26A1 Bulk Operations</h2>
            <div class="bulk-actions">
              <button class="btn btn-success" (click)="bulkInsert()">\u{1F4E5} Insert 100 Records</button>
              <button class="btn btn-warning" (click)="bulkUpdate()">\u{1F504} Update All</button>
              <button class="btn btn-danger" (click)="bulkDelete()">\u{1F5D1}\uFE0F Clear All</button>
            </div>
          </div>

          <div class="bulk-info">
            <div class="info-card">
              <h4>\u{1F4CA} Current Statistics</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Total Records:</span>
                  <span class="info-value">{{ users().length }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Operation:</span>
                  <span class="info-value">{{ lastOperation() || 'None' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bulk-log">
            <h4>Operation Log</h4>
            <div class="log-entries">
              @for (log of operationLog(); track log.timestamp) {
                <div class="log-entry">
                  <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- SQL Editor Mode -->
      @if (mode() === 'sql' && !loading()) {
        <div class="sql-section">
          <div class="section-header">
            <h2>\u{1F4BB} SQL Query Editor</h2>
            <button class="btn btn-primary" (click)="executeQuery()">\u25B6\uFE0F Execute</button>
          </div>

          <div class="sql-editor-container">
            <div class="sql-input-section">
              <label>SQL Query (SELECT only)</label>
              <textarea 
                [(ngModel)]="sqlQuery" 
                class="sql-editor"
                placeholder="SELECT * FROM users WHERE age > 30 ORDER BY age DESC"
                rows="8"></textarea>
              <div class="query-presets">
                <button class="preset-btn" (click)="setPresetQuery('all')">All Users</button>
                <button class="preset-btn" (click)="setPresetQuery('age')">By Age</button>
                <button class="preset-btn" (click)="setPresetQuery('status')">By Status</button>
                <button class="preset-btn" (click)="setPresetQuery('analytics')">Analytics</button>
              </div>
            </div>

            @if (queryResults().length > 0) {
              <div class="sql-results">
                <div class="results-header">
                  <h4>Query Results ({{ queryResults().length }} rows)</h4>
                </div>
                <div class="results-table-container">
                  <table class="results-table">
                    <thead>
                      <tr>
                        @for (key of resultKeys(); track key) {
                          <th>{{ key }}</th>
                        }
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of queryResults(); track $index) {
                        <tr>
                          @for (key of resultKeys(); track key) {
                            <td>{{ row[key] }}</td>
                          }
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,styles:[`
    .exploration-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .exploration-header {
      margin-bottom: 24px;
    }

    .exploration-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .exploration-header p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .mode-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .mode-btn {
      padding: 12px 20px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .mode-btn.active {
      background: linear-gradient(135deg, #3b82f6, #06b6d4);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(59, 130, 246, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-success { background: #10b981; color: #fff; }
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn-danger { background: #ef4444; color: #fff; }

    .btn:hover { transform: translateY(-2px); opacity: 0.9; }

    .btn-icon {
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      background: transparent;
    }

    .btn-delete:hover { background: rgba(239, 68, 68, 0.2); }

    /* CRUD Section */
    .crud-section {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
    }

    .create-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 24px;
    }

    .create-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .form-input {
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .data-table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table th {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
      color: #94a3b8;
    }

    .data-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .id-cell {
      font-family: monospace;
      color: #94a3b8;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-inactive { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
    .status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 32px;
    }

    /* Analytics Section */
    .analytics-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .analytics-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .analytics-label {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .analytics-value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .analytics-change {
      font-size: 12px;
      margin-top: 8px;
    }

    .analytics-change.positive { color: #10b981; }
    .analytics-change.negative { color: #ef4444; }

    .chart-section {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .chart-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bar-label {
      width: 80px;
      font-size: 13px;
      color: #94a3b8;
    }

    .bar-track {
      flex: 1;
      height: 32px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      transition: width 0.3s ease;
    }

    .status-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-indicator.status-active { background: #10b981; }
    .status-indicator.status-inactive { background: #94a3b8; }
    .status-indicator.status-pending { background: #f59e0b; }

    .status-info {
      flex: 1;
    }

    .status-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      text-transform: capitalize;
    }

    .status-count {
      font-size: 12px;
      color: #94a3b8;
    }

    .status-percent {
      font-size: 14px;
      font-weight: 600;
      color: #3b82f6;
    }

    /* Bulk Section */
    .bulk-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .bulk-actions {
      display: flex;
      gap: 12px;
    }

    .bulk-info {
      display: flex;
      gap: 16px;
    }

    .info-card {
      flex: 1;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .info-card h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      color: #94a3b8;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    .bulk-log {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .bulk-log h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 12px;
    }

    .log-entries {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(59, 130, 246, 0.05);
      border-radius: 4px;
      font-size: 13px;
    }

    .log-time {
      color: #94a3b8;
      font-family: monospace;
    }

    .log-message {
      color: #e2e8f0;
    }

    /* SQL Section */
    .sql-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sql-editor-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .sql-input-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sql-input-section label {
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
    }

    .sql-editor {
      width: 100%;
      padding: 16px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      resize: vertical;
    }

    .query-presets {
      display: flex;
      gap: 8px;
    }

    .preset-btn {
      padding: 8px 16px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .preset-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .sql-results {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      overflow: hidden;
    }

    .results-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-header h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .results-table-container {
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .results-table th, .results-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-table th {
      background: rgba(59, 130, 246, 0.1);
      font-weight: 600;
      color: #94a3b8;
      position: sticky;
      top: 0;
    }

    .results-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }
  `]})],d)},7313(t,e,a){a.d(e,{p:()=>d});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317);let d=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.connection=(0,s.vPA)({connected:!1,lastSync:null,pendingChanges:0,syncMode:"manual"}),this.connecting=(0,s.vPA)(!1),this.syncing=(0,s.vPA)(!1),this.sqliteUsers=(0,s.vPA)([]),this.duckdbUsers=(0,s.vPA)([]),this.syncEvents=(0,s.vPA)([]),this.pendingChanges=(0,s.vPA)([]),this.totalSyncs=(0,s.vPA)(0),this.successfulSyncs=(0,s.vPA)(0),this.conflicts=(0,s.vPA)(0),this.failedSyncs=(0,s.vPA)(0),this.avgSyncTime=(0,s.vPA)(0),this.conflictResolution="latest",this.batchSize=50,this.autoSyncInterval=5e3,this.syncDirection="bidirectional"}ngOnInit(){this.loadSqliteUsers(),this.loadDuckdbUsers()}ngOnDestroy(){this.autoSyncTimer&&clearInterval(this.autoSyncTimer)}async loadSqliteUsers(){try{let t=await this.api.callOrThrow("getUsers",[]);this.sqliteUsers.set(t)}catch(t){this.logger.error("Failed to load SQLite users",t)}}async loadDuckdbUsers(){try{let t=await this.api.callOrThrow("duckdbGetUsers",[]);this.duckdbUsers.set(t)}catch(t){this.logger.error("Failed to load DuckDB users",t)}}async toggleConnection(){this.connecting.set(!0);try{this.connection().connected?(this.autoSyncTimer&&clearInterval(this.autoSyncTimer),this.connection.set({...this.connection(),connected:!1}),this.addSyncEvent("sync","websocket",{message:"Disconnected"},"synced")):(await this.sleep(1e3),this.connection.set({...this.connection(),connected:!0,lastSync:new Date}),this.addSyncEvent("sync","websocket",{message:"Connected"},"synced"),"auto"===this.connection().syncMode&&this.startAutoSync())}catch(t){this.logger.error("Connection toggle failed",t)}finally{this.connecting.set(!1)}}async syncNow(){if(!this.connection().connected||this.syncing())return;this.syncing.set(!0);let t=Date.now();try{this.addSyncEvent("sync","websocket",{message:"Starting sync"},"pending"),await this.sleep(1e3),await Promise.all([this.loadSqliteUsers(),this.loadDuckdbUsers()]);let e=Date.now()-t;this.connection.set({...this.connection(),lastSync:new Date,pendingChanges:0}),this.addSyncEvent("sync","websocket",{message:"Sync complete",duration:e},"synced"),this.totalSyncs.update(t=>t+1),this.successfulSyncs.update(t=>t+1),this.avgSyncTime.set(e)}catch(t){this.logger.error("Sync failed",t),this.addSyncEvent("sync","websocket",{message:t.message},"failed"),this.failedSyncs.update(t=>t+1)}finally{this.syncing.set(!1)}}setSyncMode(t){this.connection.set({...this.connection(),syncMode:t}),"auto"===t&&this.connection().connected?this.startAutoSync():this.autoSyncTimer&&clearInterval(this.autoSyncTimer)}startAutoSync(){this.autoSyncTimer&&clearInterval(this.autoSyncTimer),this.autoSyncTimer=setInterval(()=>{this.connection().connected&&this.syncNow()},this.autoSyncInterval)}async addSqliteUser(){let t={name:`SQLite_User_${Date.now()}`,email:`sqlite_${Date.now()}@test.com`,age:Math.floor(40*Math.random())+20,status:"active"};try{await this.api.callOrThrow("createUser",[t]),await this.loadSqliteUsers(),this.addSyncEvent("create","sqlite",t,"pending"),this.connection.set({...this.connection(),pendingChanges:this.connection().pendingChanges+1})}catch(t){this.logger.error("Failed to add SQLite user",t)}}async addDuckdbUser(){let t={name:`DuckDB_User_${Date.now()}`,email:`duckdb_${Date.now()}@test.com`,age:Math.floor(40*Math.random())+20,status:"active"};try{await this.api.callOrThrow("duckdbCreateUser",[t]),await this.loadDuckdbUsers(),this.addSyncEvent("create","duckdb",t,"pending"),this.connection.set({...this.connection(),pendingChanges:this.connection().pendingChanges+1})}catch(t){this.logger.error("Failed to add DuckDB user",t)}}async refreshSqlite(){await this.loadSqliteUsers(),this.addSyncEvent("sync","sqlite",{message:"Refreshed SQLite data"},"synced")}async refreshDuckdb(){await this.loadDuckdbUsers(),this.addSyncEvent("sync","duckdb",{message:"Refreshed DuckDB data"},"synced")}async editUser(t,e){let a={...t,name:`${t.name}_updated`};try{"sqlite"===e?(await this.api.callOrThrow("updateUser",[a]),await this.loadSqliteUsers()):this.logger.info("DuckDB update not implemented"),this.addSyncEvent("update",e,a,"pending")}catch(t){this.logger.error("Failed to update user",t)}}async deleteUser(t,e){if(confirm("Delete this user?"))try{"sqlite"===e?(await this.api.callOrThrow("deleteUser",[t.toString()]),await this.loadSqliteUsers()):(await this.api.callOrThrow("duckdbDeleteUser",[{id:t}]),await this.loadDuckdbUsers()),this.addSyncEvent("delete",e,{id:t},"pending"),this.connection.set({...this.connection(),pendingChanges:this.connection().pendingChanges+1})}catch(t){this.logger.error("Failed to delete user",t)}}isPending(t,e){return this.pendingChanges().some(a=>a.id===t&&a.database===e)}addSyncEvent(t,e,a,s="pending"){this.syncEvents.update(i=>[{id:Date.now(),type:t,source:e,timestamp:new Date,data:a,status:s},...i].slice(0,50))}clearEvents(){this.syncEvents.set([])}sleep(t){return new Promise(e=>setTimeout(e,t))}};d=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-realtime-sync-demo",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="sync-container">
      <header class="sync-header">
        <h1>\u{1F50C} Real-Time Sync Demo</h1>
        <p>WebSocket-based real-time database synchronization</p>
      </header>

      <!-- Connection Status -->
      <div class="connection-status">
        <div class="status-indicator" [class.connected]="connection().connected" [class.disconnected]="!connection().connected">
          <span class="status-dot"></span>
          <span class="status-text">{{ connection().connected ? 'Connected' : 'Disconnected' }}</span>
        </div>
        <div class="status-info">
          <span class="info-item">
            <span class="info-label">Last Sync:</span>
            <span class="info-value">{{ connection().lastSync ? (connection().lastSync | date:'HH:mm:ss') : 'Never' }}</span>
          </span>
          <span class="info-item">
            <span class="info-label">Pending Changes:</span>
            <span class="info-value" [class.has-pending]="connection().pendingChanges > 0">{{ connection().pendingChanges }}</span>
          </span>
          <span class="info-item">
            <span class="info-label">Sync Mode:</span>
            <span class="info-value">{{ connection().syncMode === 'auto' ? '\u{1F504} Auto' : '\u{1F4CD} Manual' }}</span>
          </span>
        </div>
        <div class="status-actions">
          <button class="btn btn-sm" (click)="toggleConnection()" [disabled]="connecting()">
            {{ connection().connected ? '\u{1F50C} Disconnect' : '\u{1F50C} Connect' }}
          </button>
          <button class="btn btn-sm btn-primary" (click)="syncNow()" [disabled]="!connection().connected || syncing()">
            {{ syncing() ? '\u23F3 Syncing...' : '\u{1F504} Sync Now' }}
          </button>
        </div>
      </div>

      <!-- Sync Mode Selector -->
      <div class="sync-mode-selector">
        <button
          class="mode-btn"
          [class.active]="connection().syncMode === 'manual'"
          (click)="setSyncMode('manual')">
          \u{1F4CD} Manual Sync
        </button>
        <button
          class="mode-btn"
          [class.active]="connection().syncMode === 'auto'"
          (click)="setSyncMode('auto')">
          \u{1F504} Auto Sync (5s)
        </button>
      </div>

      <!-- Database Panels -->
      <div class="database-panels">
        <!-- SQLite Panel -->
        <div class="db-panel sqlite">
          <div class="db-panel-header">
            <h3>\u{1F5C4}\uFE0F SQLite</h3>
            <span class="record-count">{{ sqliteUsers().length }} records</span>
          </div>
          
          <div class="db-panel-actions">
            <button class="btn-action" (click)="addSqliteUser()">+ Add</button>
            <button class="btn-action" (click)="refreshSqlite()">\u{1F504} Refresh</button>
          </div>

          <div class="db-panel-content">
            <div class="user-list">
              @for (user of sqliteUsers(); track user.id) {
                <div class="user-item" [class.pending]="isPending(user.id, 'sqlite')">
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                  <div class="user-actions">
                    <button class="btn-icon" (click)="editUser(user, 'sqlite')">\u270F\uFE0F</button>
                    <button class="btn-icon btn-delete" (click)="deleteUser(user.id, 'sqlite')">\u{1F5D1}\uFE0F</button>
                  </div>
                </div>
              }
              @empty {
                <div class="empty-list">No users in SQLite</div>
              }
            </div>
          </div>
        </div>

        <!-- Sync Events Panel -->
        <div class="sync-events-panel">
          <div class="panel-header">
            <h3>\u{1F4E1} Sync Events</h3>
            <button class="btn-action" (click)="clearEvents()">\u{1F5D1}\uFE0F Clear</button>
          </div>
          <div class="events-list">
            @for (event of syncEvents(); track event.id) {
              <div class="event-item" [class]="'event-' + event.type" [class]="'event-' + event.status">
                <div class="event-icon">
                  @if (event.type === 'create') { \u2795 }
                  @else if (event.type === 'update') { \u270F\uFE0F }
                  @else if (event.type === 'delete') { \u{1F5D1}\uFE0F }
                  @else if (event.type === 'sync') { \u{1F504} }
                </div>
                <div class="event-info">
                  <div class="event-type">{{ event.type | uppercase }}</div>
                  <div class="event-source">{{ event.source }}</div>
                  <div class="event-time">{{ event.timestamp | date:'HH:mm:ss' }}</div>
                </div>
                <div class="event-status" [class]="'status-' + event.status">
                  {{ event.status }}
                </div>
              </div>
            }
            @empty {
              <div class="empty-events">No sync events yet</div>
            }
          </div>
        </div>

        <!-- DuckDB Panel -->
        <div class="db-panel duckdb">
          <div class="db-panel-header">
            <h3>\u{1F986} DuckDB</h3>
            <span class="record-count">{{ duckdbUsers().length }} records</span>
          </div>
          
          <div class="db-panel-actions">
            <button class="btn-action" (click)="addDuckdbUser()">+ Add</button>
            <button class="btn-action" (click)="refreshDuckdb()">\u{1F504} Refresh</button>
          </div>

          <div class="db-panel-content">
            <div class="user-list">
              @for (user of duckdbUsers(); track user.id) {
                <div class="user-item" [class.pending]="isPending(user.id, 'duckdb')">
                  <div class="user-info">
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                  <div class="user-actions">
                    <button class="btn-icon" (click)="editUser(user, 'duckdb')">\u270F\uFE0F</button>
                    <button class="btn-icon btn-delete" (click)="deleteUser(user.id, 'duckdb')">\u{1F5D1}\uFE0F</button>
                  </div>
                </div>
              }
              @empty {
                <div class="empty-list">No users in DuckDB</div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Sync Configuration -->
      <div class="sync-config">
        <h3>\u2699\uFE0F Sync Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Conflict Resolution</label>
            <select [(ngModel)]="conflictResolution" class="form-select">
              <option value="latest">Latest Timestamp Wins</option>
              <option value="sqlite">SQLite Always Wins</option>
              <option value="duckdb">DuckDB Always Wins</option>
              <option value="manual">Manual Resolution</option>
            </select>
          </div>
          <div class="config-item">
            <label>Batch Size</label>
            <select [(ngModel)]="batchSize" class="form-select">
              <option [ngValue]="10">10 records</option>
              <option [ngValue]="50">50 records</option>
              <option [ngValue]="100">100 records</option>
            </select>
          </div>
          <div class="config-item">
            <label>Auto-Sync Interval</label>
            <select [(ngModel)]="autoSyncInterval" class="form-select">
              <option [ngValue]="5000">5 seconds</option>
              <option [ngValue]="10000">10 seconds</option>
              <option [ngValue]="30000">30 seconds</option>
              <option [ngValue]="60000">1 minute</option>
            </select>
          </div>
          <div class="config-item">
            <label>Direction</label>
            <select [(ngModel)]="syncDirection" class="form-select">
              <option value="bidirectional">\u2194\uFE0F Bidirectional</option>
              <option value="sqlite-to-duckdb">\u{1F5C4}\uFE0F\u2192\u{1F986} SQLite to DuckDB</option>
              <option value="duckdb-to-sqlite">\u{1F986}\u2192\u{1F5C4}\uFE0F DuckDB to SQLite</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Sync Statistics -->
      <div class="sync-statistics">
        <div class="stat-card">
          <div class="stat-icon">\u{1F4CA}</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalSyncs() }}</div>
            <div class="stat-label">Total Syncs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">\u2705</div>
          <div class="stat-content">
            <div class="stat-value">{{ successfulSyncs() }}</div>
            <div class="stat-label">Successful</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">\u26A0\uFE0F</div>
          <div class="stat-content">
            <div class="stat-value">{{ conflicts() }}</div>
            <div class="stat-label">Conflicts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">\u274C</div>
          <div class="stat-content">
            <div class="stat-value">{{ failedSyncs() }}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">\u26A1</div>
          <div class="stat-content">
            <div class="stat-value">{{ avgSyncTime() }}ms</div>
            <div class="stat-label">Avg Sync Time</div>
          </div>
        </div>
      </div>
    </div>
  `,styles:[`
    .sync-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .sync-header {
      margin-bottom: 24px;
    }

    .sync-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .sync-header p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      margin-bottom: 24px;
      border: 2px solid rgba(148, 163, 184, 0.2);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .status-indicator.connected {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .status-indicator.disconnected {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .status-info {
      flex: 1;
      display: flex;
      gap: 24px;
    }

    .info-item {
      display: flex;
      gap: 8px;
      font-size: 14px;
    }

    .info-label {
      color: #94a3b8;
    }

    .info-value {
      color: #fff;
      font-weight: 600;
    }

    .info-value.has-pending {
      color: #f59e0b;
    }

    .status-actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
    }

    .btn-primary {
      background: #3b82f6;
      color: #fff;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    .sync-mode-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .mode-btn {
      flex: 1;
      padding: 14px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-radius: 10px;
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .mode-btn.active {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
      color: #fff;
    }

    .database-panels {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .db-panel {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid transparent;
    }

    .db-panel.sqlite {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .db-panel.duckdb {
      border-color: rgba(59, 130, 246, 0.3);
    }

    .db-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .db-panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .record-count {
      font-size: 13px;
      color: #94a3b8;
    }

    .db-panel-actions {
      display: flex;
      gap: 8px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .btn-action {
      padding: 6px 12px;
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #3b82f6;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: rgba(59, 130, 246, 0.2);
    }

    .db-panel-content {
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;
    }

    .user-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .user-item:hover {
      background: rgba(15, 23, 42, 0.8);
    }

    .user-item.pending {
      border-left: 3px solid #f59e0b;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }

    .user-email {
      font-size: 13px;
      color: #94a3b8;
    }

    .user-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      padding: 6px 10px;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(59, 130, 246, 0.2);
    }

    .btn-icon.btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .empty-list {
      text-align: center;
      color: #64748b;
      padding: 32px;
    }

    .sync-events-panel {
      width: 320px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      border: 2px solid rgba(139, 92, 246, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .events-list {
      flex: 1;
      padding: 12px;
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .event-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 8px;
      border-left: 3px solid transparent;
      font-size: 13px;
    }

    .event-item.event-create { border-left-color: #10b981; }
    .event-item.event-update { border-left-color: #f59e0b; }
    .event-item.event-delete { border-left-color: #ef4444; }
    .event-item.event-sync { border-left-color: #3b82f6; }

    .event-item.event-pending { opacity: 0.7; }
    .event-item.event-synced { opacity: 1; }
    .event-item.event-conflict { background: rgba(245, 158, 11, 0.1); }
    .event-item.event-failed { background: rgba(239, 68, 68, 0.1); }

    .event-icon {
      font-size: 16px;
    }

    .event-info {
      flex: 1;
    }

    .event-type {
      font-weight: 600;
      color: #fff;
      font-size: 11px;
      text-transform: uppercase;
    }

    .event-source {
      color: #94a3b8;
      font-size: 11px;
    }

    .event-time {
      color: #64748b;
      font-family: monospace;
      font-size: 11px;
    }

    .event-status {
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .event-status.status-pending {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }

    .event-status.status-synced {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .event-status.status-conflict {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .event-status.status-failed {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .empty-events {
      text-align: center;
      color: #64748b;
      padding: 32px;
      font-size: 13px;
    }

    .sync-config {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .sync-config h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .config-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .config-item label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .form-select {
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .sync-statistics {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .stat-icon {
      font-size: 32px;
    }

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

    @media (max-width: 1200px) {
      .database-panels {
        grid-template-columns: 1fr;
      }

      .sync-events-panel {
        width: 100%;
        max-height: 250px;
      }

      .config-grid,
      .sync-statistics {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]})],d)},7608(t,e,a){a.d(e,{n:()=>d});var s=a(9701),i=a(390),r=a(106),o=a(9582),n=a(769),l=a(5317);let d=class{constructor(){this.api=(0,s.WQX)(n.G),this.logger=(0,s.WQX)(l.g),this.mode=(0,s.vPA)("crud"),this.crudTab=(0,s.vPA)("list"),this.loading=(0,s.vPA)(!1),this.users=(0,s.vPA)([]),this.filteredUsers=(0,s.vPA)([]),this.editingUser=(0,s.vPA)(null),this.searchQuery=(0,s.vPA)(""),this.statusFilter=(0,s.vPA)(""),this.formData=(0,s.vPA)({id:0,name:"",email:"",age:25,status:"active"}),this.formErrors=(0,s.vPA)({}),this.constraintData=(0,s.vPA)({name:"",email:"",age:25,status:"active"}),this.constraintResult=(0,s.vPA)(null),this.transactions=(0,s.vPA)([]),this.transactionFilter=(0,s.vPA)("all"),this.filteredTransactions=(0,s.vPA)([]),this.transactionStats=(0,s.vPA)({total:0,success:0,failed:0,rate:0}),this.performanceRunning=(0,s.vPA)(!1),this.performanceResults=(0,s.vPA)([]),this.maxAvgTime=(0,s.vPA)(1),this.fastestOperation=(0,s.vPA)(""),this.slowestOperation=(0,s.vPA)(""),this.avgResponseTime=(0,s.vPA)(0)}ngOnInit(){this.loadUsers()}async loadUsers(){this.loading.set(!0);try{let t=await this.api.callOrThrow("getUsers",[]);this.users.set(t),this.filteredUsers.set(t)}catch(t){this.logger.error("Failed to load users",t)}finally{this.loading.set(!1)}}filterUsers(){let t=this.users();if(this.searchQuery()){let e=this.searchQuery().toLowerCase();t=t.filter(t=>t.name.toLowerCase().includes(e)||t.email.toLowerCase().includes(e))}this.statusFilter()&&(t=t.filter(t=>t.status===this.statusFilter())),this.filteredUsers.set(t)}async createUser(){if(this.formErrors.set({}),this.validateForm()){this.loading.set(!0);try{await this.api.callOrThrow("createUser",[this.formData()]),await this.loadUsers(),this.formData.set({id:0,name:"",email:"",age:25,status:"active"}),this.crudTab.set("list")}catch(t){this.logger.error("Failed to create user",t)}finally{this.loading.set(!1)}}}async updateUser(){if(this.formErrors.set({}),this.validateForm()){this.loading.set(!0);try{await this.api.callOrThrow("updateUser",[this.formData()]),await this.loadUsers(),this.editingUser.set(null),this.crudTab.set("list")}catch(t){this.logger.error("Failed to update user",t)}finally{this.loading.set(!1)}}}async deleteUser(t){if(confirm("Delete this user?")){this.loading.set(!0);try{await this.api.callOrThrow("deleteUser",[{id:t}]),await this.loadUsers()}catch(t){this.logger.error("Failed to delete user",t)}finally{this.loading.set(!1)}}}startEdit(t){this.editingUser.set(t),this.formData.set({id:t.id,name:t.name,email:t.email,age:t.age,status:t.status}),this.crudTab.set("edit")}cancelEdit(){this.editingUser.set(null),this.formData.set({id:0,name:"",email:"",age:25,status:"active"}),this.crudTab.set("list")}validateForm(){let t={},e=this.formData();return(!e.name||e.name.trim().length<2)&&(t.name="Name must be at least 2 characters"),e.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)||(t.email="Invalid email format"),(!e.age||e.age<0||e.age>150)&&(t.age="Age must be between 0 and 150"),this.formErrors.set(t),0===Object.keys(t).length}testNotNullConstraint(){this.constraintData().name&&0!==this.constraintData().name.trim().length?this.constraintResult.set({success:!0,message:"✅ Constraint satisfied: Name is valid"}):this.constraintResult.set({success:!1,message:"❌ Constraint violated: Name cannot be NULL"})}testUniqueConstraint(){let t=this.constraintData().email;this.users().some(e=>e.email===t)?this.constraintResult.set({success:!1,message:"❌ Constraint violated: Email already exists"}):this.constraintResult.set({success:!0,message:"✅ Constraint satisfied: Email is unique"})}testCheckConstraint(){let t=this.constraintData().age;t<0||t>150?this.constraintResult.set({success:!1,message:"❌ Constraint violated: Age must be 0-150"}):this.constraintResult.set({success:!0,message:"✅ Constraint satisfied: Age is valid"})}testEnumConstraint(){["active","inactive","pending","suspended"].includes(this.constraintData().status)?this.constraintResult.set({success:!0,message:"✅ Constraint satisfied: Status is valid"}):this.constraintResult.set({success:!1,message:"❌ Constraint violated: Invalid status value"})}updateConstraintName(t){this.constraintData.update(e=>({...e,name:t}))}updateConstraintEmail(t){this.constraintData.update(e=>({...e,email:t}))}updateConstraintAge(t){this.constraintData.update(e=>({...e,age:t}))}updateConstraintStatus(t){this.constraintData.update(e=>({...e,status:t}))}updateFormStatus(t){this.formData.update(e=>({...e,status:t}))}updateFormName(t){this.formData.update(e=>({...e,name:t}))}updateFormEmail(t){this.formData.update(e=>({...e,email:t}))}updateFormAge(t){this.formData.update(e=>({...e,age:t}))}async loadTransactionHistory(){let t=[{id:1,operation:"INSERT",table:"users",timestamp:new Date().toISOString(),success:!0},{id:2,operation:"UPDATE",table:"users",timestamp:new Date(Date.now()-6e4).toISOString(),success:!0},{id:3,operation:"DELETE",table:"users",timestamp:new Date(Date.now()-12e4).toISOString(),success:!1},{id:4,operation:"SELECT",table:"users",timestamp:new Date(Date.now()-18e4).toISOString(),success:!0}];this.transactions.set(t),this.filterTransactions();let e=t.length,a=t.filter(t=>t.success).length;this.transactionStats.set({total:e,success:a,failed:e-a,rate:Math.round(a/e*100)})}filterTransactions(){let t=this.transactions();"success"===this.transactionFilter()?t=t.filter(t=>t.success):"failed"===this.transactionFilter()&&(t=t.filter(t=>!t.success)),this.filteredTransactions.set(t)}async runPerformanceTest(){this.performanceRunning.set(!0),this.performanceResults.set([]);let t=[],e=this.users();try{let a=Date.now();for(let t=0;t<10;t++)await this.api.callOrThrow("createUser",[{name:"Test User "+t,email:"test"+t+"@example.com",age:25+t,status:"active"}]);let s=Date.now()-a;t.push({operation:"INSERT",count:10,totalTime:s,avgTime:(s/10).toFixed(2),opsPerSecond:Math.round(10/s*1e3)}),await this.loadUsers();let i=Date.now();await this.api.callOrThrow("getUsers",[]);let r=Date.now()-i;t.push({operation:"SELECT",count:1,totalTime:r,avgTime:r.toFixed(2),opsPerSecond:Math.round(1e3/r)});let o=Date.now();for(let t=0;t<5&&t<e.length;t++)await this.api.callOrThrow("updateUser",[{...e[t],name:e[t].name+" (updated)"}]);let n=Date.now()-o;t.push({operation:"UPDATE",count:Math.min(5,e.length),totalTime:n,avgTime:(n/Math.min(5,e.length)).toFixed(2),opsPerSecond:Math.round(Math.min(5,e.length)/n*1e3)});let l=Date.now(),d=Math.min(10,e.length);for(let t=0;t<d;t++){let e=this.users()[t];e&&await this.api.callOrThrow("deleteUser",[{id:e.id}])}let c=Date.now()-l;t.push({operation:"DELETE",count:d,totalTime:c,avgTime:(c/d).toFixed(2),opsPerSecond:Math.round(d/c*1e3)}),this.performanceResults.set(t),this.maxAvgTime.set(Math.max(...t.map(t=>parseFloat(t.avgTime))));let u=[...t].sort((t,e)=>parseFloat(t.avgTime)-parseFloat(e.avgTime));this.fastestOperation.set(u[0]?.operation||""),this.slowestOperation.set(u[u.length-1]?.operation||""),this.avgResponseTime.set(Math.round(t.reduce((t,e)=>t+parseFloat(e.avgTime),0)/t.length)),await this.loadUsers()}catch(t){this.logger.error("Performance test failed",t)}finally{this.performanceRunning.set(!1)}}};d=((t,e)=>{for(var a,s=e,i=t.length-1;i>=0;i--)(a=t[i])&&(s=a(s)||s);return s})([(0,i.uAl)({selector:"app-sqlite-exploration",standalone:!0,imports:[r.MD,o.YN],template:`
    <div class="exploration-container">
      <header class="exploration-header">
        <h1>\u{1F5C4}\uFE0F SQLite Integration Exploration</h1>
        <p>Discover SQLite's transactional integrity and constraint features</p>
      </header>

      <!-- Mode Selector -->
      <div class="mode-selector">
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'crud'"
          (click)="mode.set('crud')">
          \u{1F4CB} Full CRUD
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'constraints'"
          (click)="mode.set('constraints')">
          \u{1F512} Constraints
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'transactions'"
          (click)="loadTransactionHistory(); mode.set('transactions')">
          \u{1F504} Transactions
        </button>
        <button 
          class="mode-btn" 
          [class.active]="mode() === 'performance'"
          (click)="runPerformanceTest(); mode.set('performance')">
          \u26A1 Performance
        </button>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>
      }

      <!-- Full CRUD Mode -->
      @if (mode() === 'crud' && !loading()) {
        <div class="crud-section">
          <div class="tabs">
            <button 
              class="tab-btn" 
              [class.active]="crudTab() === 'list'"
              (click)="crudTab.set('list')">
              \u{1F4CB} User List
            </button>
            <button 
              class="tab-btn" 
              [class.active]="crudTab() === 'create'"
              (click)="crudTab.set('create')">
              \u2795 Create
            </button>
            @if (editingUser()) {
              <button 
                class="tab-btn active"
                (click)="crudTab.set('edit')">
                \u270F\uFE0F Edit
              </button>
            }
          </div>

          @if (crudTab() === 'list') {
            <div class="list-controls">
              <input 
                type="text" 
                placeholder="Search users..." 
                class="search-input"
                [(ngModel)]="searchQuery"
                (input)="filterUsers()">
              <select [(ngModel)]="statusFilter" (change)="filterUsers()" class="filter-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of filteredUsers(); track user.id) {
                    <tr>
                      <td class="id-cell">#{{ user.id }}</td>
                      <td class="name-cell">{{ user.name }}</td>
                      <td class="email-cell">{{ user.email }}</td>
                      <td>{{ user.age }}</td>
                      <td>
                        <span class="status-badge" [class]="'status-' + user.status">
                          {{ user.status }}
                        </span>
                      </td>
                      <td>{{ user.created_at | date:'MMM d, y' }}</td>
                      <td>{{ user.updated_at | date:'MMM d, y' }}</td>
                      <td class="actions-cell">
                        <button class="btn-icon btn-edit" (click)="startEdit(user)">\u270F\uFE0F</button>
                        <button class="btn-icon btn-delete" (click)="deleteUser(user.id)">\u{1F5D1}\uFE0F</button>
                      </td>
                    </tr>
                  }
                  @empty {
                    <tr>
                      <td colspan="8" class="empty-state">No users found</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (crudTab() === 'create' || crudTab() === 'edit') {
            <div class="form-card">
              <h3>{{ crudTab() === 'create' ? 'Create New User' : 'Edit User' }}</h3>
              <form (ngSubmit)="crudTab() === 'create' ? createUser() : updateUser()" class="user-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.name" 
                      name="name" 
                      required
                      minlength="2"
                      maxlength="256"
                      class="form-input"
                      [class.error]="formErrors().name">
                    @if (formErrors().name) {
                      <span class="error-text">{{ formErrors().name }}</span>
                    }
                  </div>

                  <div class="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      [ngModel]="formData().email"
                      (ngModelChange)="updateFormEmail($event)"
                      name="email" 
                      required
                      class="form-input"
                      [class.error]="formErrors().email">
                    @if (formErrors().email) {
                      <span class="error-text">{{ formErrors().email }}</span>
                    }
                  </div>

                  <div class="form-group">
                    <label>Age *</label>
                    <input 
                      type="number" 
                      [ngModel]="formData().age"
                      (ngModelChange)="updateFormAge($event)"
                      name="age"
                      required
                      min="0"
                      max="150"
                      class="form-input"
                      [class.error]="formErrors().age">
                    @if (formErrors().age) {
                      <span class="error-text">{{ formErrors().age }}</span>
                    }
                  </div>

                  <div class="form-group">
                    <label>Status *</label>
                    <select
                      [ngModel]="formData().status"
                      (ngModelChange)="updateFormStatus($event)"
                      name="status"
                      required
                      class="form-input">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-success">
                    {{ crudTab() === 'create' ? '\u2705 Create User' : '\u{1F4BE} Save Changes' }}
                  </button>
                  <button type="button" class="btn btn-secondary" (click)="cancelEdit()">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      }

      <!-- Constraints Mode -->
      @if (mode() === 'constraints' && !loading()) {
        <div class="constraints-section">
          <div class="section-header">
            <h2>\u{1F512} Database Constraints Demo</h2>
            <p>Test SQLite's data integrity features</p>
          </div>

          <div class="constraints-grid">
            <div class="constraint-card">
              <h3>NOT NULL Constraint</h3>
              <p>Fields marked as required cannot be empty</p>
              <div class="constraint-demo">
                <input type="text" placeholder="Enter name (required)" [ngModel]="constraintData().name" (ngModelChange)="updateConstraintName($event)" class="demo-input">
                <button class="btn btn-primary" (click)="testNotNullConstraint()">Test</button>
              </div>
              @if (constraintResult()) {
                <div class="constraint-result" [class.success]="constraintResult()?.success" [class.error]="!constraintResult()?.success">
                  {{ constraintResult()?.message }}
                </div>
              }
            </div>

            <div class="constraint-card">
              <h3>UNIQUE Constraint</h3>
              <p>Email addresses must be unique across all records</p>
              <div class="constraint-demo">
                <input type="email" placeholder="Enter email" [ngModel]="constraintData().email" (ngModelChange)="updateConstraintEmail($event)" class="demo-input">
                <button class="btn btn-primary" (click)="testUniqueConstraint()">Test</button>
              </div>
              @if (constraintResult()) {
                <div class="constraint-result" [class.success]="constraintResult()?.success" [class.error]="!constraintResult()?.success">
                  {{ constraintResult()?.message }}
                </div>
              }
            </div>

            <div class="constraint-card">
              <h3>CHECK Constraint</h3>
              <p>Age must be between 0 and 150</p>
              <div class="constraint-demo">
                <input type="number" placeholder="Enter age (0-150)" [ngModel]="constraintData().age" (ngModelChange)="updateConstraintAge($event)" class="demo-input">
                <button class="btn btn-primary" (click)="testCheckConstraint()">Test</button>
              </div>
              @if (constraintResult()) {
                <div class="constraint-result" [class.success]="constraintResult()?.success" [class.error]="!constraintResult()?.success">
                  {{ constraintResult()?.message }}
                </div>
              }
            </div>

            <div class="constraint-card">
              <h3>ENUM Constraint</h3>
              <p>Status must be one of: active, inactive, pending, suspended</p>
              <div class="constraint-demo">
                <select [ngModel]="constraintData().status" (ngModelChange)="updateConstraintStatus($event)" class="demo-input">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="pending">pending</option>
                  <option value="suspended">suspended</option>
                  <option value="invalid">invalid (test)</option>
                </select>
                <button class="btn btn-primary" (click)="testEnumConstraint()">Test</button>
              </div>
              @if (constraintResult()) {
                <div class="constraint-result" [class.success]="constraintResult()?.success" [class.error]="!constraintResult()?.success">
                  {{ constraintResult()?.message }}
                </div>
              }
            </div>
          </div>

          <div class="schema-info">
            <h3>Users Table Schema</h3>
            <pre class="schema-code">CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    age INTEGER CHECK (age >= 0 AND age <= 150),
    status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);</pre>
          </div>
        </div>
      }

      <!-- Transactions Mode -->
      @if (mode() === 'transactions' && !loading()) {
        <div class="transactions-section">
          <div class="section-header">
            <h2>\u{1F504} Transaction History</h2>
            <button class="btn btn-primary" (click)="loadTransactionHistory()">\u{1F504} Refresh</button>
          </div>

          <div class="transaction-stats">
            <div class="stat-card">
              <div class="stat-label">Total Operations</div>
              <div class="stat-value">{{ transactionStats().total }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Successful</div>
              <div class="stat-value success">{{ transactionStats().success }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Failed</div>
              <div class="stat-value error">{{ transactionStats().failed }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Success Rate</div>
              <div class="stat-value">{{ transactionStats().rate }}%</div>
            </div>
          </div>

          <div class="transaction-log">
            <div class="log-header">
              <h3>Recent Operations</h3>
              <div class="log-filters">
                <button class="filter-chip" [class.active]="transactionFilter() === 'all'" (click)="transactionFilter.set('all')">All</button>
                <button class="filter-chip" [class.active]="transactionFilter() === 'success'" (click)="transactionFilter.set('success')">Success</button>
                <button class="filter-chip" [class.active]="transactionFilter() === 'failed'" (click)="transactionFilter.set('failed')">Failed</button>
              </div>
            </div>
            <div class="log-entries">
              @for (log of filteredTransactions(); track log.id) {
                <div class="log-entry" [class.success]="log.success" [class.failed]="!log.success">
                  <div class="log-icon">{{ log.success ? '\u2705' : '\u274C' }}</div>
                  <div class="log-content">
                    <div class="log-operation">{{ log.operation }}</div>
                    <div class="log-detail">{{ log.table }} \u2022 {{ log.timestamp | date:'medium' }}</div>
                  </div>
                </div>
              }
              @empty {
                <div class="empty-log">No transaction history available</div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Performance Mode -->
      @if (mode() === 'performance' && !loading()) {
        <div class="performance-section">
          <div class="section-header">
            <h2>\u26A1 Performance Testing</h2>
            <button class="btn btn-success" (click)="runPerformanceTest()" [disabled]="performanceRunning()">
              {{ performanceRunning() ? '\u23F3 Running...' : '\u25B6\uFE0F Run Test' }}
            </button>
          </div>

          @if (performanceResults().length > 0) {
            <div class="results-grid">
              @for (result of performanceResults(); track result.operation) {
                <div class="result-card">
                  <div class="result-header">
                    <h4>{{ result.operation }}</h4>
                    <span class="result-count">{{ result.count }} ops</span>
                  </div>
                  <div class="result-metrics">
                    <div class="metric">
                      <span class="metric-label">Total Time</span>
                      <span class="metric-value">{{ result.totalTime }}ms</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Avg per Op</span>
                      <span class="metric-value">{{ result.avgTime }}ms</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Ops/Second</span>
                      <span class="metric-value highlight">{{ result.opsPerSecond }}</span>
                    </div>
                  </div>
                  <div class="result-bar">
                    <div class="bar-fill" [style.width.%]="(result.avgTime / maxAvgTime()) * 100"></div>
                  </div>
                </div>
              }
            </div>

            <div class="performance-summary">
              <h3>Performance Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="summary-label">Fastest Operation:</span>
                  <span class="summary-value">{{ fastestOperation() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Slowest Operation:</span>
                  <span class="summary-value">{{ slowestOperation() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Average Response:</span>
                  <span class="summary-value">{{ avgResponseTime() }}ms</span>
                </div>
              </div>
            </div>
          } @else {
            <div class="performance-intro">
              <p>Click "Run Test" to benchmark SQLite operations:</p>
              <ul>
                <li>\u{1F4CA} Insert 50 records</li>
                <li>\u{1F4CA} Read all records</li>
                <li>\u{1F4CA} Update 25 records</li>
                <li>\u{1F4CA} Delete 25 records</li>
              </ul>
            </div>
          }
        </div>
      }
    </div>
  `,styles:[`
    .exploration-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .exploration-header {
      margin-bottom: 24px;
    }

    .exploration-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px;
    }

    .exploration-header p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .mode-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .mode-btn {
      padding: 12px 20px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.5);
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .mode-btn.active {
      background: linear-gradient(135deg, #10b981, #059669);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      padding-bottom: 12px;
    }

    .tab-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      background: rgba(16, 185, 129, 0.1);
      color: #fff;
    }

    .tab-btn.active {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .section-header p {
      color: #94a3b8;
      margin: 0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-success { background: #10b981; color: #fff; }
    .btn-secondary { background: #64748b; color: #fff; }

    .btn:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }

    .btn-icon {
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      background: transparent;
    }

    .btn-edit:hover { background: rgba(245, 158, 11, 0.2); }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.2); }

    /* CRUD Section */
    .crud-section {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      padding: 24px;
    }

    .list-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .search-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .filter-select {
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .data-table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table th {
      background: rgba(16, 185, 129, 0.1);
      font-weight: 600;
      color: #94a3b8;
    }

    .data-table tr:hover {
      background: rgba(16, 185, 129, 0.05);
    }

    .id-cell {
      font-family: monospace;
      color: #94a3b8;
    }

    .name-cell {
      font-weight: 500;
      color: #fff;
    }

    .email-cell {
      color: #94a3b8;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-inactive { background: rgba(148, 163, 184, 0.2); color: #94a3b8; }
    .status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .status-suspended { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 32px;
    }

    .form-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 24px;
    }

    .form-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .form-input {
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .error-text {
      color: #ef4444;
      font-size: 12px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    /* Constraints Section */
    .constraints-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .constraints-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .constraint-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .constraint-card h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px;
    }

    .constraint-card p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 16px;
    }

    .constraint-demo {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .demo-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 14px;
    }

    .constraint-result {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
    }

    .constraint-result.success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .constraint-result.error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .schema-info {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .schema-info h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .schema-code {
      background: rgba(30, 41, 59, 0.8);
      padding: 16px;
      border-radius: 6px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      color: #10b981;
      overflow-x: auto;
      margin: 0;
    }

    /* Transactions Section */
    .transactions-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .transaction-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .stat-value.success { color: #10b981; }
    .stat-value.error { color: #ef4444; }

    .transaction-log {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      overflow: hidden;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .log-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .log-filters {
      display: flex;
      gap: 8px;
    }

    .filter-chip {
      padding: 6px 12px;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .filter-chip:hover {
      border-color: rgba(16, 185, 129, 0.3);
      color: #fff;
    }

    .filter-chip.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.3);
      color: #10b981;
    }

    .log-entries {
      display: flex;
      flex-direction: column;
      max-height: 400px;
      overflow-y: auto;
    }

    .log-entry {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.05);
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-entry.success {
      background: rgba(16, 185, 129, 0.05);
    }

    .log-entry.failed {
      background: rgba(239, 68, 68, 0.05);
    }

    .log-icon {
      font-size: 18px;
    }

    .log-content {
      flex: 1;
    }

    .log-operation {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .log-detail {
      font-size: 12px;
      color: #94a3b8;
    }

    .empty-log {
      text-align: center;
      color: #94a3b8;
      padding: 32px;
    }

    /* Performance Section */
    .performance-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .result-card {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .result-header h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .result-count {
      font-size: 12px;
      color: #94a3b8;
    }

    .result-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .metric {
      text-align: center;
    }

    .metric-label {
      font-size: 11px;
      color: #94a3b8;
      display: block;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    .metric-value.highlight {
      color: #10b981;
    }

    .result-bar {
      height: 4px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    .performance-summary {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 20px;
    }

    .performance-summary h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-label {
      font-size: 12px;
      color: #94a3b8;
    }

    .summary-value {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    .performance-intro {
      background: rgba(15, 23, 42, 0.8);
      border-radius: 8px;
      padding: 24px;
    }

    .performance-intro p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 16px;
    }

    .performance-intro ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .performance-intro li {
      font-size: 14px;
      color: #e2e8f0;
      padding: 8px 0;
    }
  `]})],d)}}]);
//# sourceMappingURL=main~2.6ed5f125977b4845.js.map