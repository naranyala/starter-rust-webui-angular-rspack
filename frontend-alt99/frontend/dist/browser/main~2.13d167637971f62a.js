"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["969"],{333(e,t,a){a.d(t,{o:()=>d});var s=a(9701),r=a(390),i=a(106),o=a(9582),n=a(5317),l=a(6971);let d=class{constructor(){this.logger=(0,s.WQX)(n.g),this.api=(0,s.WQX)(l.G),this.isLoading=(0,s.vPA)(!1),this.activeTab=(0,s.vPA)("markers"),this.selectedCategory="",this.locationQuery="",this.mapZoom=(0,s.vPA)(100),this.mapBounds=(0,s.vPA)({north:90,south:-90,east:180,west:-180}),this.markers=(0,s.vPA)([]),this.filteredMarkers=(0,s.vPA)([]),this.selectedMarker=(0,s.vPA)(null),this.categoryStats=(0,s.vPA)({}),this.categoryColors={city:"#3b82f6",landmark:"#8b5cf6",restaurant:"#f59e0b",hotel:"#10b981",airport:"#ef4444"},this.categoryIcons={city:"\uD83C\uDFD9️",landmark:"\uD83C\uDFDB️",restaurant:"\uD83C\uDF7D️",hotel:"\uD83C\uDFE8",airport:"✈️"}}ngOnInit(){this.loadSampleData()}async loadSampleData(){this.isLoading.set(!0);try{await new Promise(e=>setTimeout(e,500)),this.markers.set([{id:"1",name:"New York",lat:150,lng:220,category:"city",description:"The Big Apple"},{id:"2",name:"London",lat:120,lng:480,category:"city",description:"Capital of UK"},{id:"3",name:"Tokyo",lat:140,lng:820,category:"city",description:"Capital of Japan"},{id:"4",name:"Sydney",lat:380,lng:840,category:"city",description:"Largest city in Australia"},{id:"5",name:"Paris",lat:130,lng:500,category:"landmark",description:"City of Light"},{id:"6",name:"Dubai",lat:200,lng:620,category:"landmark",description:"Modern metropolis"},{id:"7",name:"Singapore",lat:240,lng:720,category:"city",description:"Garden City"},{id:"8",name:"Rio de Janeiro",lat:380,lng:290,category:"city",description:"Marvelous City"},{id:"9",name:"Cape Town",lat:380,lng:540,category:"city",description:"Mother City"},{id:"10",name:"Mumbai",lat:220,lng:680,category:"city",description:"Financial capital of India"}].map(e=>({location:e,color:this.categoryColors[e.category]||"#3b82f6"}))),this.filterMarkers(),this.updateStats(),this.logger.info("Sample map data loaded")}catch(e){this.logger.error("Failed to load map data",e)}finally{this.isLoading.set(!1)}}addRandomMarker(){let e=Object.keys(this.categoryColors),t=e[Math.floor(Math.random()*e.length)],a={id:`marker_${Date.now()}`,name:`Location ${this.markers().length+1}`,lat:100+350*Math.random(),lng:100+750*Math.random(),category:t,description:"User-added location"};this.markers.update(e=>[...e,{location:a,color:this.categoryColors[t]}]),this.filterMarkers(),this.updateStats(),this.logger.info("Marker added")}clearMarkers(){this.markers.set([]),this.filteredMarkers.set([]),this.selectedMarker.set(null),this.updateStats(),this.logger.info("All markers cleared")}filterMarkers(){this.selectedCategory?this.filteredMarkers.set(this.markers().filter(e=>e.location.category===this.selectedCategory)):this.filteredMarkers.set(this.markers())}selectMarker(e){this.selectedMarker.set(e),this.logger.info(`Selected marker: ${e.location.name}`)}deleteMarker(e){this.markers.update(t=>t.filter(t=>t.location.id!==e)),this.selectedMarker()?.location.id===e&&this.selectedMarker.set(null),this.filterMarkers(),this.updateStats(),this.logger.info("Marker deleted")}searchLocation(){if(!this.locationQuery.trim())return;let e=this.locationQuery.toLowerCase(),t=this.markers().find(t=>t.location.name.toLowerCase().includes(e));t?(this.selectMarker(t),this.logger.info(`Found location: ${t.location.name}`)):this.logger.warn("Location not found")}zoomIn(){this.mapZoom.update(e=>Math.min(e+20,200))}zoomOut(){this.mapZoom.update(e=>Math.max(e-20,50))}resetView(){this.mapZoom.set(100),this.selectedMarker.set(null)}getCategoryIcon(e){return this.categoryIcons[e]||"\uD83D\uDCCD"}updateStats(){let e={};this.markers().forEach(t=>{let a=t.location.category;e[a]=(e[a]||0)+1}),this.categoryStats.set(e)}};d=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-maps-demo",standalone:!0,imports:[i.MD,o.YN],template:`
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">\u{1F5FA}\uFE0F</span>
            Maps & Geographic Visualization
          </h1>
          <p class="demo-description">Interactive map with markers, GeoJSON, and spatial analysis</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="map-toolbar">
        <div class="toolbar-group">
          <button class="btn btn-sm btn-secondary" (click)="addRandomMarker()">
            <span>\u{1F4CD}</span> Add Marker
          </button>
          <button class="btn btn-sm btn-secondary" (click)="clearMarkers()">
            <span>\u{1F5D1}\uFE0F</span> Clear All
          </button>
          <button class="btn btn-sm btn-secondary" (click)="loadSampleData()">
            <span>\u{1F4CA}</span> Load Sample
          </button>
        </div>

        <div class="toolbar-group">
          <div class="search-box">
            <input
              type="text"
              class="search-input"
              [(ngModel)]="locationQuery"
              (keyup.enter)="searchLocation()"
              placeholder="Search location..."
            />
            <button class="search-btn" (click)="searchLocation()">\u{1F50D}</button>
          </div>
        </div>

        <div class="toolbar-group">
          <select class="map-select" [(ngModel)]="selectedCategory" (change)="filterMarkers()">
            <option value="">All Categories</option>
            <option value="city">Cities</option>
            <option value="landmark">Landmarks</option>
            <option value="restaurant">Restaurants</option>
            <option value="hotel">Hotels</option>
            <option value="airport">Airports</option>
          </select>
        </div>
      </div>

      <!-- Main Map Area -->
      <div class="map-container">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading map...</span>
          </div>
        } @else {
          <div class="map-wrapper">
            <!-- Map Canvas (SVG-based mock map) -->
            <svg class="map-canvas" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
              <!-- Map Background -->
              <defs>
                <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1e3a5f;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0f2744;stop-opacity:1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Ocean Background -->
              <rect width="1000" height="600" fill="url(#oceanGradient)" />

              <!-- Continents (simplified shapes) -->
              <g class="continents">
                <!-- North America -->
                <path class="continent"
                      d="M 50,80 L 200,60 L 280,100 L 300,200 L 250,280 L 150,250 L 80,180 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />

                <!-- South America -->
                <path class="continent"
                      d="M 220,300 L 300,320 L 320,400 L 280,500 L 240,480 L 200,380 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />

                <!-- Europe -->
                <path class="continent"
                      d="M 450,80 L 550,70 L 580,120 L 560,180 L 500,170 L 440,140 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />

                <!-- Africa -->
                <path class="continent"
                      d="M 480,200 L 580,200 L 620,280 L 600,400 L 540,420 L 480,350 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />

                <!-- Asia -->
                <path class="continent"
                      d="M 600,60 L 800,60 L 900,120 L 880,220 L 750,240 L 650,200 L 600,140 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />

                <!-- Australia -->
                <path class="continent"
                      d="M 780,320 L 880,320 L 900,380 L 850,420 L 780,400 Z"
                      fill="#2d4a3e" stroke="#3d5a4e" stroke-width="2" />
              </g>

              <!-- Grid Lines -->
              <g class="grid-lines" stroke="#3d5a4e" stroke-width="0.5" opacity="0.3">
                @for (lat of [100, 200, 300, 400, 500]; track lat) {
                  <line x1="0" [attr.y1]="lat" x2="1000" [attr.y2]="lat" />
                }
                @for (lng of [100, 200, 300, 400, 500, 600, 700, 800, 900]; track lng) {
                  <line [attr.x1]="lng" y1="0" [attr.x2]="lng" y2="600" />
                }
              </g>

              <!-- Markers -->
              <g class="markers">
                @for (marker of filteredMarkers(); track marker.location.id) {
                  <g
                    class="marker-group"
                    [attr.transform]="'translate(' + marker.location.lng + ',' + marker.location.lat + ')'"
                    (click)="selectMarker(marker)"
                    style="cursor: pointer"
                  >
                    <!-- Marker Shadow -->
                    <ellipse cx="0" cy="15" rx="8" ry="4" fill="rgba(0,0,0,0.3)" />

                    <!-- Marker Pin -->
                    <circle cx="0" cy="-5" r="12" [attr.fill]="marker.color" filter="url(#glow)" />
                    <circle cx="0" cy="-5" r="6" fill="rgba(255,255,255,0.3)" />

                    <!-- Marker Icon -->
                    <text x="0" y="-1" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">
                      {{ getCategoryIcon(marker.location.category) }}
                    </text>

                    <!-- Label (shown on hover/selected) -->
                    @if (selectedMarker()?.location.id === marker.location.id) {
                      <g transform="translate(15, -20)">
                        <rect x="0" y="-20" width="150" height="40" rx="4" fill="rgba(15,23,42,0.9)" stroke="#475569" stroke-width="1" />
                        <text x="10" y="-5" fill="#fff" font-size="12" font-weight="600">{{ marker.location.name }}</text>
                        <text x="10" y="10" fill="#94a3b8" font-size="10">{{ marker.location.category }}</text>
                      </g>
                    }
                  </g>
                }
              </g>
            </svg>

            <!-- Map Controls -->
            <div class="map-controls">
              <button class="control-btn" (click)="zoomIn()" title="Zoom In">+</button>
              <button class="control-btn" (click)="zoomOut()" title="Zoom Out">\u2212</button>
              <button class="control-btn" (click)="resetView()" title="Reset View">\u27F2</button>
            </div>

            <!-- Zoom Indicator -->
            <div class="zoom-indicator">
              {{ mapZoom() }}%
            </div>
          </div>
        }
      </div>

      <!-- Side Panel -->
      <div class="side-panel">
        <div class="panel-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'markers'"
            (click)="activeTab.set('markers')"
          >
            Markers ({{ markers().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'stats'"
            (click)="activeTab.set('stats')"
          >
            Statistics
          </button>
        </div>

        <div class="panel-content">
          @if (activeTab() === 'markers') {
            <div class="markers-list">
              @if (filteredMarkers().length === 0) {
                <div class="empty-state">
                  <span class="empty-icon">\u{1F4ED}</span>
                  <span>No markers</span>
                </div>
              } @else {
                @for (marker of filteredMarkers(); track marker.location.id) {
                  <div
                    class="marker-item"
                    [class.selected]="selectedMarker()?.location.id === marker.location.id"
                    (click)="selectMarker(marker)"
                  >
                    <div class="marker-color" [style.background]="marker.color"></div>
                    <div class="marker-info">
                      <div class="marker-name">{{ marker.location.name }}</div>
                      <div class="marker-category">{{ marker.location.category }}</div>
                      <div class="marker-coords">
                        {{ marker.location.lat.toFixed(2) }}, {{ marker.location.lng.toFixed(2) }}
                      </div>
                    </div>
                    <button class="marker-delete" (click)="deleteMarker(marker.location.id)">\u2715</button>
                  </div>
                }
              }
            </div>
          } @else if (activeTab() === 'stats') {
            <div class="stats-panel">
              <div class="stat-item">
                <span class="stat-label">Total Markers</span>
                <span class="stat-value">{{ markers().length }}</span>
              </div>

              <div class="stat-item">
                <span class="stat-label">Categories</span>
                <div class="category-breakdown">
                  @for (item of categoryStats() | keyvalue; track item.key) {
                    <div class="category-stat">
                      <span class="category-icon">{{ getCategoryIcon(item.key) }}</span>
                      <span class="category-name">{{ item.key }}</span>
                      <span class="category-count">{{ item.value }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="stat-item">
                <span class="stat-label">Map Bounds</span>
                <div class="bounds-info">
                  <div>N: {{ mapBounds().north.toFixed(2) }}</div>
                  <div>S: {{ mapBounds().south.toFixed(2) }}</div>
                  <div>E: {{ mapBounds().east.toFixed(2) }}</div>
                  <div>W: {{ mapBounds().west.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,styles:[`
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

    .map-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-box {
      display: flex;
      gap: 4px;
    }

    .search-input {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }

    .search-btn {
      padding: 8px 12px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .map-select {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.3);
    }

    .map-container {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      height: 500px;
      overflow: hidden;
      margin-bottom: 24px;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #94a3b8;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(148, 163, 184, 0.2);
      border-top-color: #06b6d4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .map-canvas {
      width: 100%;
      height: 100%;
      background: #0f2744;
    }

    .continent {
      transition: fill 0.3s;
    }

    .continent:hover {
      fill: #3d5a4e;
    }

    .map-controls {
      position: absolute;
      right: 16px;
      top: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .control-btn {
      width: 36px;
      height: 36px;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .control-btn:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.5);
    }

    .zoom-indicator {
      position: absolute;
      bottom: 16px;
      right: 16px;
      padding: 6px 12px;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
    }

    .side-panel {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .panel-tabs {
      display: flex;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .tab-btn {
      flex: 1;
      padding: 14px 20px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }

    .tab-btn:hover {
      background: rgba(148, 163, 184, 0.05);
      color: #fff;
    }

    .tab-btn.active {
      color: #06b6d4;
      border-bottom-color: #06b6d4;
      background: rgba(6, 182, 212, 0.05);
    }

    .panel-content {
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
    }

    .markers-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .marker-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .marker-item:hover {
      background: rgba(59, 130, 246, 0.1);
    }

    .marker-item.selected {
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .marker-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .marker-info {
      flex: 1;
      min-width: 0;
    }

    .marker-name {
      font-weight: 600;
      color: #fff;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .marker-category {
      font-size: 12px;
      color: #94a3b8;
      text-transform: capitalize;
    }

    .marker-coords {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
    }

    .marker-delete {
      padding: 4px 8px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .marker-delete:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #94a3b8;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .stats-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }

    .category-breakdown {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 6px;
    }

    .category-icon {
      font-size: 16px;
    }

    .category-name {
      flex: 1;
      font-size: 13px;
      color: #e2e8f0;
      text-transform: capitalize;
    }

    .category-count {
      font-size: 13px;
      font-weight: 600;
      color: #06b6d4;
    }

    .bounds-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .map-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .toolbar-group {
        justify-content: center;
      }

      .search-input {
        width: 100%;
      }

      .map-container {
        height: 400px;
      }

      .side-panel {
        max-height: 400px;
      }
    }
  `]})],d)},2040(e,t,a){a.d(t,{v:()=>d});var s=a(9701),r=a(390),i=a(106),o=a(9582),n=a(5317),l=a(6971);let d=class{constructor(){this.logger=(0,s.WQX)(n.g),this.api=(0,s.WQX)(l.G),this.isLoading=(0,s.vPA)(!1),this.pdfLoaded=(0,s.vPA)(!1),this.currentPage=(0,s.vPA)(1),this.totalPages=(0,s.vPA)(0),this.zoom=(0,s.vPA)(100),this.searchQuery="",this.showInfoModal=(0,s.vPA)(!1),this.pages=(0,s.vPA)([]),this.pdfInfo=(0,s.vPA)({title:"",author:"",pages:0,size:"",createdDate:""}),this.searchResults=(0,s.vPA)([]),this.currentResult=(0,s.vPA)(0),this.mockParagraphs=[["full","full","full","short"],["full","full","short"],["full","full","full","full","short"]]}ngOnInit(){}async loadSamplePdf(){this.isLoading.set(!0);try{await new Promise(e=>setTimeout(e,1e3)),this.pages.set([{pageNumber:1,width:612,height:792},{pageNumber:2,width:612,height:792},{pageNumber:3,width:612,height:792},{pageNumber:4,width:612,height:792},{pageNumber:5,width:612,height:792}]),this.totalPages.set(5),this.currentPage.set(1),this.pdfLoaded.set(!0),this.pdfInfo.set({title:"Sample Document",author:"Demo Author",pages:5,size:"245 KB",createdDate:new Date().toLocaleDateString()}),this.logger.info("Sample PDF loaded")}catch(e){this.logger.error("Failed to load PDF",e)}finally{this.isLoading.set(!1)}}previousPage(){this.currentPage()>1&&this.currentPage.update(e=>e-1)}nextPage(){this.currentPage()<this.totalPages()&&this.currentPage.update(e=>e+1)}goToPage(e){e>=1&&e<=this.totalPages()&&this.currentPage.set(e)}zoomIn(){200>this.zoom()&&this.zoom.update(e=>Math.min(e+25,200))}zoomOut(){this.zoom()>50&&this.zoom.update(e=>Math.max(e-25,50))}fitToWidth(){this.zoom.set(100)}fitToPage(){this.zoom.set(80)}searchInPdf(){if(!this.searchQuery.trim())return;let e=[{page:1,snippet:`...sample text containing "${this.searchQuery}" in the document...`},{page:3,snippet:`...another occurrence of "${this.searchQuery}" found here...`},{page:5,snippet:`...final mention of "${this.searchQuery}" in conclusion...`}];this.searchResults.set(e),this.currentResult.set(0),this.logger.info(`Found ${e.length} results for "${this.searchQuery}"`)}goToResult(e){let t=this.searchResults()[e];t&&(this.currentPage.set(t.page),this.currentResult.set(e))}clearSearch(){this.searchQuery="",this.searchResults.set([])}showInfo(){this.showInfoModal.set(!0)}closeInfo(){this.showInfoModal.set(!1)}};d=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-pdf-viewer-demo",standalone:!0,imports:[i.MD,o.YN],template:`
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">\u{1F4C4}</span>
            PDF Viewer Demo
          </h1>
          <p class="demo-description">Interactive PDF viewing with navigation and search</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="pdf-toolbar">
        <div class="toolbar-group">
          <button class="btn-icon" (click)="previousPage()" [disabled]="currentPage() <= 1" title="Previous Page">
            \u2B05\uFE0F
          </button>
          <span class="page-indicator">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          <button class="btn-icon" (click)="nextPage()" [disabled]="currentPage() >= totalPages()" title="Next Page">
            \u27A1\uFE0F
          </button>
        </div>

        <div class="toolbar-group">
          <button class="btn-icon" (click)="zoomOut()" [disabled]="zoom() <= 50" title="Zoom Out">
            \u{1F50D}-
          </button>
          <span class="zoom-level">{{ zoom() }}%</span>
          <button class="btn-icon" (click)="zoomIn()" [disabled]="zoom() >= 200" title="Zoom In">
            \u{1F50D}+
          </button>
          <button class="btn-icon" (click)="fitToWidth()" title="Fit to Width">
            \u2194\uFE0F
          </button>
          <button class="btn-icon" (click)="fitToPage()" title="Fit to Page">
            \u{1F4C4}
          </button>
        </div>

        <div class="toolbar-group">
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchQuery"
            (keyup.enter)="searchInPdf()"
            placeholder="Search in PDF..."
          />
          <button class="btn btn-sm btn-primary" (click)="searchInPdf()">Search</button>
        </div>

        <div class="toolbar-group">
          <button class="btn btn-sm btn-secondary" (click)="loadSamplePdf()">Load Sample</button>
          <button class="btn btn-sm btn-secondary" (click)="showInfo()">Info</button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="pdf-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading PDF...</span>
          </div>
        } @else if (pdfLoaded()) {
          <div class="pdf-viewer" [style.zoom]="zoom() / 100">
            <!-- PDF Canvas Placeholder -->
            <div class="pdf-page-placeholder">
              <div class="pdf-page-mock">
                <div class="mock-header">
                  <div class="mock-line"></div>
                  <div class="mock-line short"></div>
                </div>
                @for (para of mockParagraphs; track para) {
                  <div class="mock-paragraph">
                    @for (line of para; track line) {
                      <div class="mock-line" [class.short]="line === 'short'"></div>
                    }
                  </div>
                }
                <div class="page-number">Page {{ currentPage() }}</div>
              </div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">\u{1F4C4}</div>
            <h3>No PDF Loaded</h3>
            <p>Click "Load Sample" to view a sample PDF document</p>
            <button class="btn btn-primary" (click)="loadSamplePdf()">
              <span>\u{1F4C4}</span> Load Sample PDF
            </button>
          </div>
        }
      </div>

      <!-- Thumbnails Panel -->
      @if (pdfLoaded()) {
        <div class="thumbnails-panel">
          <div class="panel-header">
            <h3 class="panel-title">Pages</h3>
          </div>
          <div class="thumbnails-grid">
            @for (page of pages(); track page.pageNumber) {
              <div
                class="thumbnail"
                [class.active]="currentPage() === page.pageNumber"
                (click)="goToPage(page.pageNumber)"
              >
                <div class="thumbnail-mock">
                  <div class="thumbnail-line"></div>
                  <div class="thumbnail-line short"></div>
                  <div class="thumbnail-line"></div>
                </div>
                <span class="thumbnail-number">{{ page.pageNumber }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Info Modal -->
      @if (showInfoModal()) {
        <div class="modal-overlay" (click)="closeInfo()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2 class="modal-title">Document Information</h2>
              <button class="modal-close" (click)="closeInfo()">\u2715</button>
            </div>
            <div class="modal-body">
              <div class="info-grid">
                <div class="info-label">Title:</div>
                <div class="info-value">{{ pdfInfo().title }}</div>

                <div class="info-label">Author:</div>
                <div class="info-value">{{ pdfInfo().author }}</div>

                <div class="info-label">Pages:</div>
                <div class="info-value">{{ pdfInfo().pages }}</div>

                <div class="info-label">Size:</div>
                <div class="info-value">{{ pdfInfo().size }}</div>

                <div class="info-label">Created:</div>
                <div class="info-value">{{ pdfInfo().createdDate }}</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" (click)="closeInfo()">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- Search Results -->
      @if (searchResults().length > 0) {
        <div class="search-results">
          <div class="results-header">
            <span class="results-count">{{ searchResults().length }} results found</span>
            <button class="btn-icon btn-sm" (click)="clearSearch()">\u2715</button>
          </div>
          <div class="results-list">
            @for (result of searchResults(); track result.page; let i = $index) {
              <div
                class="result-item"
                [class.active]="currentResult() === i"
                (click)="goToResult(i)"
              >
                <span class="result-page">Page {{ result.page }}</span>
                <span class="result-text">{{ result.snippet }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,styles:[`
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

    .pdf-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-indicator,
    .zoom-level {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      min-width: 80px;
      text-align: center;
    }

    .search-input {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      width: 200px;
    }

    .search-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }

    .btn-icon {
      padding: 8px 12px;
      background: rgba(148, 163, 184, 0.2);
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: rgba(148, 163, 184, 0.3);
    }

    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn {
      display: flex;
      align-items: center;
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

    .pdf-content {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      min-height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #94a3b8;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(148, 163, 184, 0.2);
      border-top-color: #06b6d4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 20px;
      color: #fff;
      margin: 0 0 8px;
    }

    .empty-state p {
      margin: 0 0 24px;
    }

    .pdf-viewer {
      width: 100%;
      height: 600px;
      overflow: auto;
      padding: 20px;
    }

    .pdf-page-placeholder {
      max-width: 800px;
      margin: 0 auto;
    }

    .pdf-page-mock {
      background: #fff;
      padding: 40px;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      color: #1f2937;
    }

    .mock-header {
      margin-bottom: 32px;
    }

    .mock-line {
      height: 12px;
      background: #e5e7eb;
      margin-bottom: 12px;
      border-radius: 2px;
    }

    .mock-line.short {
      width: 60%;
    }

    .mock-paragraph {
      margin-bottom: 20px;
    }

    .page-number {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }

    .thumbnails-panel {
      margin-top: 24px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .panel-header {
      margin-bottom: 16px;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .thumbnails-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
    }

    .thumbnail {
      background: rgba(15, 23, 42, 0.5);
      border: 2px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .thumbnail:hover {
      border-color: rgba(59, 130, 246, 0.5);
    }

    .thumbnail.active {
      border-color: #06b6d4;
      background: rgba(6, 182, 212, 0.1);
    }

    .thumbnail-mock {
      background: #fff;
      padding: 6px;
      border-radius: 2px;
      margin-bottom: 6px;
    }

    .thumbnail-line {
      height: 4px;
      background: #e5e7eb;
      margin-bottom: 4px;
      border-radius: 1px;
    }

    .thumbnail-line.short {
      width: 60%;
    }

    .thumbnail-number {
      display: block;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    .modal-close:hover {
      color: #fff;
    }

    .modal-body {
      padding: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      align-items: baseline;
    }

    .info-label {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .info-value {
      font-size: 14px;
      color: #fff;
    }

    .modal-footer {
      padding: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      display: flex;
      justify-content: flex-end;
    }

    /* Search Results */
    .search-results {
      margin-top: 24px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-count {
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
    }

    .results-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .result-item {
      padding: 12px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      cursor: pointer;
      transition: background 0.2s;
    }

    .result-item:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .result-item.active {
      background: rgba(6, 182, 212, 0.1);
    }

    .result-page {
      font-size: 12px;
      font-weight: 600;
      color: #06b6d4;
      margin-right: 12px;
    }

    .result-text {
      font-size: 13px;
      color: #e2e8f0;
    }

    @media (max-width: 768px) {
      .pdf-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .toolbar-group {
        justify-content: center;
      }

      .search-input {
        width: 100%;
      }

      .thumbnails-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]})],d)},1501(e,t,a){a.d(t,{Qp:()=>o,os:()=>b,HJ:()=>m,nS:()=>u,ib:()=>c,lM:()=>p,tI:()=>h,Rj:()=>g});var s=a(3380),r=a(390),i=a(106);let o=class{constructor(){this.variant=(0,s.input)("primary"),this.size=(0,s.input)("md"),this.icon=(0,s.input)(),this.label=(0,s.input)(""),this.loading=(0,s.input)(!1),this.disabled=(0,s.input)(!1),this.ariaLabel=(0,s.input)(),this.type=(0,s.input)("button"),this.clicked=(0,s.output)()}handleClick(e){this.clicked.emit(e)}};o=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-button",standalone:!0,imports:[i.MD],template:`
    <button
      class="btn"
      [class.btn-primary]="variant() === 'primary'"
      [class.btn-secondary]="variant() === 'secondary'"
      [class.btn-danger]="variant() === 'danger'"
      [class.btn-ghost]="variant() === 'ghost'"
      [class.btn-outline]="variant() === 'outline'"
      [class.btn-sm]="size() === 'sm'"
      [class.btn-md]="size() === 'md'"
      [class.btn-lg]="size() === 'lg'"
      [class.btn-loading]="loading()"
      [class.btn-icon]="icon()"
      [disabled]="disabled() || loading()"
      (click)="handleClick($event)"
      [attr.aria-label]="ariaLabel()"
      [attr.type]="type()"
    >
      @if (loading()) {
        <span class="btn-spinner">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle class="spinner-track" cx="12" cy="12" r="10" />
            <circle class="spinner-indicator" cx="12" cy="12" r="10" />
          </svg>
        </span>
      }
      @if (icon() && !loading()) {
        <span class="btn-icon-wrapper">{{ icon() }}</span>
      }
      @if (label()) {
        <span class="btn-label">{{ label() }}</span>
      }
      <ng-content></ng-content>
    </button>
  `,styles:[`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      position: relative;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
      }
    }

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(148, 163, 184, 0.3);
      }
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.3);
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
      }
    }

    .btn-ghost {
      background: transparent;
      color: #94a3b8;
      
      &:hover:not(:disabled) {
        background: rgba(148, 163, 184, 0.1);
      }
    }

    .btn-outline {
      background: transparent;
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.3);
      
      &:hover:not(:disabled) {
        background: rgba(6, 182, 212, 0.1);
      }
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-md {
      padding: 10px 20px;
      font-size: 14px;
    }

    .btn-lg {
      padding: 14px 28px;
      font-size: 16px;
    }

    .btn-loading {
      pointer-events: none;
    }

    .btn-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }

    .spinner-track {
      fill: none;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 3;
    }

    .spinner-indicator {
      fill: none;
      stroke: currentColor;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 30 50;
      stroke-dashoffset: 0;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .btn-icon-wrapper {
      font-size: 16px;
      line-height: 1;
    }

    .btn-label {
      line-height: 1.2;
    }

    .btn-icon {
      padding: 8px;
      border-radius: 6px;
      
      &.btn-sm {
        padding: 4px;
      }
      
      &.btn-lg {
        padding: 12px;
      }
    }
  `]})],o);var n=Object.defineProperty,l=Object.getOwnPropertyDescriptor,d=(e,t,a,s)=>{for(var r,i=s>1?void 0:s?l(t,a):t,o=e.length-1;o>=0;o--)(r=e[o])&&(i=(s?r(t,a,i):r(i))||i);return s&&i&&n(t,a,i),i};let c=class{constructor(){this.hoverable=(0,s.input)(!1)}};c=d([(0,r.uAl)({selector:"app-card",standalone:!0,imports:[i.MD],template:`
    <div class="card" [class.card-hoverable]="hoverable()">
      <ng-content select="app-card-header"></ng-content>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <ng-content select="app-card-footer"></ng-content>
    </div>
  `,styles:[`
    .card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .card-hoverable {
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        border-color: rgba(148, 163, 184, 0.2);
      }
    }

    .card-body {
      padding: 20px;
    }
  `]})],c);let p=class{constructor(){this.title=(0,s.input)(""),this.subtitle=(0,s.input)(""),this.icon=(0,s.input)()}};p=d([(0,r.uAl)({selector:"app-card-header",standalone:!0,imports:[i.MD],template:`
    <div class="card-header">
      <div class="card-header-content">
        @if (icon()) {
          <span class="card-header-icon">{{ icon() }}</span>
        }
        <h3 class="card-header-title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="card-header-subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="card-header-actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,styles:[`
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.3);
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .card-header-icon {
      font-size: 20px;
    }

    .card-header-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .card-header-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 0 8px;
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]})],p);let g=class{constructor(){this.bordered=(0,s.input)(!0)}};g=d([(0,r.uAl)({selector:"app-card-footer",standalone:!0,imports:[i.MD],template:`
    <div class="card-footer" [class.card-footer-bordered]="bordered()">
      <ng-content></ng-content>
    </div>
  `,styles:[`
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(15, 23, 42, 0.3);
      gap: 12px;
      flex-wrap: wrap;
    }

    .card-footer-bordered {
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
  `]})],g);let u=class{constructor(){this.variant=(0,s.input)("default"),this.size=(0,s.input)("md"),this.color=(0,s.input)()}getBackground(){return this.color()?this.color():""}getTextColor(){return this.color()?"#fff":""}};u=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-badge",standalone:!0,imports:[i.MD],template:`
    @if (variant() === 'dot') {
      <span
        class="badge badge-dot"
        [class.badge-sm]="size() === 'sm'"
        [class.badge-md]="size() === 'md'"
        [style.background]="color()"
      ></span>
    } @else {
      <span
        class="badge"
        [class]="'badge-' + variant()"
        [class.badge-sm]="size() === 'sm'"
        [class.badge-md]="size() === 'md'"
        [style.background]="getBackground()"
        [style.color]="getTextColor()"
      >
        <ng-content></ng-content>
      </span>
    }
  `,styles:[`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
    }

    .badge-sm {
      padding: 2px 8px;
      font-size: 11px;
    }

    .badge-md {
      padding: 4px 12px;
      font-size: 12px;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      padding: 0;
    }

    .badge-default {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
    }

    .badge-primary {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .badge-info {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
    }
  `]})],u);let h=class{constructor(){this.size=(0,s.input)("md"),this.color=(0,s.input)("#06b6d4"),this.label=(0,s.input)("")}};h=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-spinner",standalone:!0,imports:[i.MD],template:`
    <div
      class="spinner-container"
      [class.spinner-sm]="size() === 'sm'"
      [class.spinner-md]="size() === 'md'"
      [class.spinner-lg]="size() === 'lg'"
      [style.color]="color()"
    >
      <svg class="spinner" viewBox="0 0 24 24">
        <circle class="spinner-track" cx="12" cy="12" r="10" />
        <circle class="spinner-indicator" cx="12" cy="12" r="10" />
      </svg>
      @if (label()) {
        <span class="spinner-label">{{ label() }}</span>
      }
    </div>
  `,styles:[`
    .spinner-container {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #06b6d4;
    }

    .spinner {
      animation: spin 1s linear infinite;
    }

    .spinner-sm {
      & .spinner {
        width: 16px;
        height: 16px;
      }
    }

    .spinner-md {
      & .spinner {
        width: 24px;
        height: 24px;
      }
    }

    .spinner-lg {
      & .spinner {
        width: 40px;
        height: 40px;
      }
    }

    .spinner-track {
      fill: none;
      stroke: rgba(148, 163, 184, 0.2);
      stroke-width: 3;
    }

    .spinner-indicator {
      fill: none;
      stroke: currentColor;
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 30 50;
      stroke-dashoffset: 0;
    }

    .spinner-label {
      font-size: 13px;
      color: #94a3b8;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]})],h);let b=class{constructor(){this.icon=(0,s.input)("\uD83D\uDCED"),this.title=(0,s.input)(""),this.description=(0,s.input)(""),this.showActions=(0,s.input)(!0)}};b=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-empty-state",standalone:!0,imports:[i.MD],template:`
    <div class="empty-state">
      @if (icon()) {
        <div class="empty-icon">{{ icon() }}</div>
      }
      @if (title()) {
        <h3 class="empty-title">{{ title() }}</h3>
      }
      @if (description()) {
        <p class="empty-description">{{ description() }}</p>
      }
      @if (showActions()) {
        <div class="empty-actions">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,styles:[`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px;
    }

    .empty-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 24px;
      max-width: 400px;
    }

    .empty-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
  `]})],b);let m=class{constructor(){this.value=(0,s.input)("0"),this.label=(0,s.input)(""),this.icon=(0,s.input)("\uD83D\uDCCA"),this.variant=(0,s.input)("primary"),this.trend=(0,s.input)()}getIconBackground(){return({primary:"rgba(59, 130, 246, 0.2)",success:"rgba(16, 185, 129, 0.2)",warning:"rgba(245, 158, 11, 0.2)",info:"rgba(6, 182, 212, 0.2)",danger:"rgba(239, 68, 68, 0.2)"})[this.variant()]}};m=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-stats-card",standalone:!0,imports:[i.MD],template:`
    <div class="stats-card" [class]="'stats-' + variant()">
      <div class="stats-icon" [style.background]="getIconBackground()">
        {{ icon() }}
      </div>
      <div class="stats-content">
        @if (trend() !== undefined && trend() !== null) {
          <div class="stats-trend" [class.trend-positive]="trend()! >= 0" [class.trend-negative]="trend()! < 0">
            <span class="trend-value">{{ trend()! >= 0 ? '+' : '' }}{{ trend() }}%</span>
            <span class="trend-label">vs last period</span>
          </div>
        }
        <span class="stats-value">{{ value() }}</span>
        <span class="stats-label">{{ label() }}</span>
      </div>
    </div>
  `,styles:[`
    .stats-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }
    }

    .stats-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .stats-primary .stats-icon { background: rgba(59, 130, 246, 0.2); }
    .stats-success .stats-icon { background: rgba(16, 185, 129, 0.2); }
    .stats-warning .stats-icon { background: rgba(245, 158, 11, 0.2); }
    .stats-info .stats-icon { background: rgba(6, 182, 212, 0.2); }
    .stats-danger .stats-icon { background: rgba(239, 68, 68, 0.2); }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .stats-trend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }

    .trend-positive { color: #10b981; }
    .trend-negative { color: #ef4444; }

    .trend-value {
      font-weight: 700;
    }

    .trend-label {
      color: #94a3b8;
    }

    .stats-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      line-height: 1;
    }

    .stats-label {
      font-size: 13px;
      color: #94a3b8;
    }
  `]})],m)},5397(e,t,a){a.d(t,{m:()=>p});var s=a(9701),r=a(390),i=a(106),o=a(9582),n=a(5317),l=a(2541),d=a(9309),c=a(1501);let p=class{constructor(){this.logger=(0,s.WQX)(n.g),this.backend=(0,s.WQX)(l.m3),this.confirmModal=(0,s.WQX)(l.Rj),this.isLoading=(0,s.vPA)(!1),this.saving=(0,s.vPA)(!1),this.showModal=(0,s.vPA)(!1),this.isEditing=(0,s.vPA)(!1),this.errorMessage=(0,s.vPA)(""),this.selectedUser=(0,s.vPA)(null),this.users=(0,s.vPA)([]),this.filteredUsers=(0,s.vPA)([]),this.stats=(0,s.vPA)({totalUsers:0,activeUsers:0,adminUsers:0,todayCount:0}),this.filters=(0,s.vPA)({search:"",role:"",status:"",sortBy:"name",sortOrder:"asc"}),this.formData={name:"",email:"",role:"User",status:"Active"}}ngOnInit(){this.loadUsers()}async loadUsers(){this.isLoading.set(!0);try{let[e,t]=await Promise.all([this.backend.callOrThrow(d.h.Users.GET_ALL).catch(()=>[]),this.backend.callOrThrow(d.h.Users.GET_STATS).catch(()=>({totalUsers:0,activeUsers:0,adminUsers:0,todayCount:0}))]);this.users.set(e),this.stats.set(t),this.applyFilters(),this.logger.info(`Loaded ${e.length} users`)}catch(e){this.logger.error("Failed to load users",e),this.errorMessage.set("Failed to load users. Please try again.")}finally{this.isLoading.set(!1)}}applyFilters(){let e=[...this.users()],{search:t,role:a,status:s,sortBy:r,sortOrder:i}=this.filters();if(t.trim()){let a=t.toLowerCase();e=e.filter(e=>e.name.toLowerCase().includes(a)||e.email.toLowerCase().includes(a))}a&&(e=e.filter(e=>e.role===a)),s&&(e=e.filter(e=>e.status===s)),e.sort((e,t)=>{let a=0;switch(r){case"name":a=e.name.localeCompare(t.name);break;case"email":a=e.email.localeCompare(t.email);break;case"createdAt":a=new Date(e.createdAt).getTime()-new Date(t.createdAt).getTime()}return"asc"===i?a:-a}),this.filteredUsers.set(e)}toggleSortOrder(){this.filters.update(e=>({...e,sortOrder:"asc"===e.sortOrder?"desc":"asc"})),this.applyFilters()}formatDate(e){return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}getInitials(e){return e.split(" ").map(e=>e[0]).join("").toUpperCase().slice(0,2)}getRoleBadge(e){switch(e){case"Admin":return"warning";case"Manager":return"primary";default:return"default"}}getStatusBadge(e){switch(e){case"Active":return"success";case"Inactive":default:return"default";case"Suspended":return"danger"}}showCreateModal(){this.isEditing.set(!1),this.formData={name:"",email:"",role:"User",status:"Active"},this.errorMessage.set(""),this.showModal.set(!0)}editUser(e){this.isEditing.set(!0),this.selectedUser.set(e),this.formData={name:e.name,email:e.email,role:e.role,status:e.status},this.errorMessage.set(""),this.showModal.set(!0)}closeModal(){this.showModal.set(!1),this.errorMessage.set(""),this.selectedUser.set(null)}async saveUser(){if(!this.formData.name?.trim())return void this.errorMessage.set("Name is required");if(!this.formData.email?.trim())return void this.errorMessage.set("Email is required");if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email))return void this.errorMessage.set("Please enter a valid email address");this.saving.set(!0),this.errorMessage.set("");try{if(this.isEditing()){let e=this.selectedUser()?.id||0;await this.backend.callOrThrow(d.h.Users.UPDATE,[e,this.formData.name,this.formData.email,this.formData.role,this.formData.status]),this.logger.info("User updated successfully")}else await this.backend.callOrThrow(d.h.Users.CREATE,[this.formData.name,this.formData.email,this.formData.role,this.formData.status]),this.logger.info("User created successfully");await this.loadUsers(),this.closeModal()}catch(e){this.logger.error("Failed to save user",e),this.errorMessage.set(e.message||"Failed to save user")}finally{this.saving.set(!1)}}async deleteUser(e){if(!await this.confirmModal.showDeleteConfirm({title:"Delete User",itemName:e.name,itemDescription:e.email,confirmText:`DELETE ${e.email}`,warningMessage:`You are about to permanently delete <strong>${e.name}</strong> (${e.email}).<br/><br/>All associated data will be removed.`}))return void this.logger.info("Delete cancelled by user");try{await this.backend.callOrThrow(d.h.Users.DELETE,[e.id]),this.logger.info("User deleted successfully"),await this.loadUsers()}catch(e){this.logger.error("Failed to delete user",e),this.errorMessage.set(e.message||"Failed to delete user")}}};p=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-sqlite-user-demo",standalone:!0,imports:[i.MD,o.YN,c.Qp,c.HJ,c.nS,c.tI,c.os],template:`
    <div class="sqlite-demo">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">\u{1F5C4}\uFE0F</span>
            <div class="header-text">
              <h1 class="page-title">User Management</h1>
              <p class="page-subtitle">SQLite-powered user administration with complete CRUD operations</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="primary"
              icon="\u2795"
              label="Add User"
              (click)="showCreateModal()"
            />
          </div>
        </div>
      </header>

      <!-- Statistics Dashboard -->
      <section class="stats-section">
        <app-stats-card
          value="{{ stats().totalUsers }}"
          label="Total Users"
          icon="\u{1F465}"
          variant="primary"
        />
        <app-stats-card
          value="{{ stats().activeUsers }}"
          label="Active Users"
          icon="\u2705"
          variant="success"
        />
        <app-stats-card
          value="{{ stats().adminUsers }}"
          label="Administrators"
          icon="\u{1F451}"
          variant="warning"
        />
        <app-stats-card
          value="{{ stats().todayCount }}"
          label="Added Today"
          icon="\u{1F4C5}"
          variant="info"
        />
      </section>

      <!-- Filters and Search -->
      <section class="filters-section">
        <div class="filters-bar">
          <div class="search-container">
            <span class="search-icon">\u{1F50D}</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search by name or email..."
              [(ngModel)]="filters().search"
              (input)="applyFilters()"
            />
          </div>
          
          <div class="filters-group">
            <select
              class="filter-select"
              [(ngModel)]="filters().role"
              (change)="applyFilters()"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="User">User</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().status"
              (change)="applyFilters()"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().sortBy"
              (change)="applyFilters()"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="createdAt">Sort by Date</option>
            </select>

            <button
              class="filter-select"
              (click)="toggleSortOrder()"
              title="Toggle Sort Order"
            >
              {{ filters().sortOrder === 'asc' ? '\u2191' : '\u2193' }}
            </button>

            <app-button
              variant="secondary"
              icon="\u{1F504}"
              label="Refresh"
              (click)="loadUsers()"
            />
          </div>
        </div>
      </section>

      <!-- Data Table -->
      <section class="table-section">
        <div class="table-container">
          @if (isLoading()) {
            <div class="loading-container">
              <app-spinner size="lg" label="Loading users..." />
            </div>
          } @else if (filteredUsers().length === 0) {
            <app-empty-state
              icon="\u{1F4ED}"
              title="No users found"
              description="Try adjusting your search or filters to find what you're looking for."
              [showActions]="false"
            />
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-id">ID</th>
                  <th class="col-user">User</th>
                  <th class="col-role">Role</th>
                  <th class="col-status">Status</th>
                  <th class="col-date">Created</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr class="table-row" [class.row-active]="selectedUser()?.id === user.id">
                    <td class="cell-id">
                      <span class="id-badge">#{{ user.id }}</span>
                    </td>
                    <td class="cell-user">
                      <div class="user-info">
                        <div class="user-avatar">{{ getInitials(user.name) }}</div>
                        <div class="user-details">
                          <div class="user-name">{{ user.name }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="cell-role">
                      <app-badge
                        [variant]="getRoleBadge(user.role)"
                        size="md"
                      >
                        {{ user.role }}
                      </app-badge>
                    </td>
                    <td class="cell-status">
                      <app-badge
                        [variant]="getStatusBadge(user.status)"
                        size="md"
                      >
                        {{ user.status }}
                      </app-badge>
                    </td>
                    <td class="cell-date">
                      <span class="date-text">{{ formatDate(user.createdAt) }}</span>
                    </td>
                    <td class="cell-actions">
                      <div class="action-buttons">
                        <button
                          class="action-btn btn-edit"
                          (click)="editUser(user)"
                          title="Edit User"
                        >
                          \u270F\uFE0F
                        </button>
                        <button
                          class="action-btn btn-delete"
                          (click)="deleteUser(user)"
                          title="Delete User"
                        >
                          \u{1F5D1}\uFE0F
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <!-- Table Footer -->
          @if (filteredUsers().length > 0) {
            <div class="table-footer">
              <span class="results-count">
                Showing {{ filteredUsers().length }} of {{ users().length }} users
              </span>
            </div>
          }
        </div>
      </section>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">{{ isEditing() ? '\u270F\uFE0F' : '\u2795' }}</span>
                <h2 class="modal-title">{{ isEditing() ? 'Edit User' : 'Create New User' }}</h2>
              </div>
              <button class="modal-close" (click)="closeModal()">\u2715</button>
            </div>

            <form class="modal-form" (ngSubmit)="saveUser()">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    Full Name
                    <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="John Doe"
                    autocomplete="name"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Email Address
                    <span class="required">*</span>
                  </label>
                  <input
                    type="email"
                    class="form-input"
                    [(ngModel)]="formData.email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    autocomplete="email"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select class="form-input" [(ngModel)]="formData.role" name="role">
                    <option value="User">User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-input" [(ngModel)]="formData.status" name="status">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              @if (errorMessage()) {
                <div class="form-error">
                  <span class="error-icon">\u26A0\uFE0F</span>
                  <span class="error-message">{{ errorMessage() }}</span>
                </div>
              }

              <div class="modal-footer">
                <app-button
                  variant="secondary"
                  label="Cancel"
                  type="button"
                  (click)="closeModal()"
                />
                <app-button
                  variant="primary"
                  [label]="saving() ? 'Saving...' : (isEditing() ? 'Update User' : 'Create User')"
                  [loading]="saving()"
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,styles:[`
    .sqlite-demo {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
      line-height: 1;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    /* Statistics Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    /* Filters Section */
    .filters-section {
      margin-bottom: 24px;
    }

    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .search-container {
      flex: 1;
      max-width: 400px;
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      opacity: 0.5;
    }

    .search-input {
      width: 100%;
      padding: 12px 16px 12px 44px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .filters-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-select {
      padding: 10px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: rgba(148, 163, 184, 0.3);
      }

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
      }
    }

    /* Table Section */
    .table-section {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-container {
      overflow: hidden;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      padding: 14px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table td {
      padding: 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      color: #e2e8f0;
      font-size: 14px;
    }

    .table-row {
      transition: all 0.2s;

      &:hover {
        background: rgba(59, 130, 246, 0.05);
      }

      &.row-active {
        background: rgba(59, 130, 246, 0.1);
      }
    }

    .col-id { width: 80px; }
    .col-user { min-width: 250px; }
    .col-role { width: 120px; }
    .col-status { width: 120px; }
    .col-date { width: 140px; }
    .col-actions { width: 120px; }

    .cell-id {
      font-family: 'Fira Code', monospace;
      font-size: 13px;
      color: #64748b;
    }

    .id-badge {
      padding: 4px 10px;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 6px;
      font-size: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #fff;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .date-text {
      font-size: 13px;
      color: #94a3b8;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      background: transparent;
      opacity: 0.7;
      transition: all 0.2s;

      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }

      &.btn-edit:hover {
        background: rgba(59, 130, 246, 0.2);
      }

      &.btn-delete:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      background: rgba(15, 23, 42, 0.5);
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    .results-count {
      font-size: 13px;
      color: #94a3b8;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-container {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .modal-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-icon {
      font-size: 24px;
    }

    .modal-title {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      transition: all 0.2s;

      &:hover {
        color: #fff;
        transform: rotate(90deg);
      }
    }

    .modal-form {
      padding: 24px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required {
      color: #ef4444;
    }

    .form-input {
      padding: 12px 14px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: rgba(59, 130, 246, 0.5);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }

    .form-error {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 14px;
    }

    .error-icon {
      font-size: 18px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-container {
        max-width: 100%;
      }

      .filters-group {
        flex-wrap: wrap;
      }
    }

    @media (max-width: 768px) {
      .sqlite-demo {
        padding: 16px;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-branding {
        flex-direction: column;
        text-align: center;
      }

      .stats-section {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .data-table {
        font-size: 13px;
      }

      .user-info {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]})],p)},1225(e,t,a){a.d(t,{F:()=>d});var s=a(9701),r=a(390),i=a(106),o=a(7012),n=a(5317),l=a(1501);let d=class{constructor(){this.vega=(0,s.WQX)(o.R),this.logger=(0,s.WQX)(n.g),this.chartTypes=[{id:"bar",label:"Bar Charts",icon:"\uD83D\uDCCA"},{id:"line",label:"Line Charts",icon:"\uD83D\uDCC8"},{id:"area",label:"Area Charts",icon:"\uD83C\uDF0A"},{id:"scatter",label:"Scatter Plot",icon:"⚬"},{id:"pie",label:"Pie/Donut",icon:"\uD83E\uDD67"}],this.selectedChart=(0,s.vPA)("bar"),this.currentData=(0,s.vPA)([]),this.currentDataColumns=(0,s.vPA)([])}ngOnInit(){this.selectChart("bar")}ngAfterViewInit(){setTimeout(()=>this.renderCharts(),100)}selectChart(e){this.selectedChart.set(e),this.generateDataForChart(e)}generateDataForChart(e){switch(e){case"bar":this.currentData.set(this.vega.generateSampleData("bar")),this.currentDataColumns.set(["category","value"]);break;case"line":case"area":this.currentData.set(this.vega.generateSampleData("line")),this.currentDataColumns.set(["date","value"]);break;case"scatter":this.currentData.set(this.vega.generateSampleData("scatter")),this.currentDataColumns.set(["x","y","category"]);break;case"pie":this.currentData.set(this.vega.generateSampleData("pie")),this.currentDataColumns.set(["category","value"])}}async renderCharts(){let e=this.selectedChart();document.querySelectorAll(".chart-container").forEach(e=>{e.innerHTML=""}),await new Promise(e=>setTimeout(e,100));try{switch(e){case"bar":await this.renderBarCharts();break;case"line":await this.renderLineCharts();break;case"area":await this.renderAreaChart();break;case"scatter":await this.renderScatterPlot();break;case"pie":await this.renderPieCharts()}this.logger.info(`Rendered ${e} charts successfully`)}catch(e){this.logger.error("Failed to render charts",e)}}async renderBarCharts(){let e=this.vega.generateSampleData("bar");await this.vega.createBarChart("#bar-chart",e,{title:"Sales by Category",xField:"category",yField:"value"}),await this.vega.createStackedBarChart("#stacked-bar-chart",[{quarter:"Q1",region:"North",sales:4e3},{quarter:"Q1",region:"South",sales:3e3},{quarter:"Q1",region:"East",sales:2e3},{quarter:"Q1",region:"West",sales:3500},{quarter:"Q2",region:"North",sales:4500},{quarter:"Q2",region:"South",sales:3200},{quarter:"Q2",region:"East",sales:2300},{quarter:"Q2",region:"West",sales:3800},{quarter:"Q3",region:"North",sales:4200},{quarter:"Q3",region:"South",sales:3500},{quarter:"Q3",region:"East",sales:2100},{quarter:"Q3",region:"West",sales:4e3},{quarter:"Q4",region:"North",sales:5e3},{quarter:"Q4",region:"South",sales:4e3},{quarter:"Q4",region:"East",sales:2800},{quarter:"Q4",region:"West",sales:4500}],{title:"Quarterly Sales by Region",xField:"quarter",yField:"sales",categoryField:"region"}),await this.vega.createGroupedBarChart("#grouped-bar-chart",[{product:"Product A",year:"2022",sales:4e3},{product:"Product A",year:"2023",sales:4500},{product:"Product A",year:"2024",sales:5e3},{product:"Product B",year:"2022",sales:3e3},{product:"Product B",year:"2023",sales:3500},{product:"Product B",year:"2024",sales:4e3},{product:"Product C",year:"2022",sales:2e3},{product:"Product C",year:"2023",sales:2500},{product:"Product C",year:"2024",sales:3e3}],{title:"Product Sales Comparison",xField:"product",yField:"sales",categoryField:"year"})}async renderLineCharts(){let e=this.vega.generateSampleData("line");await this.vega.createLineChart("#line-chart",e,{title:"Monthly Revenue Trend",xField:"date",yField:"value"});let t=[...this.vega.generateSampleData("line").map(e=>({...e,category:"Category A"})),...this.vega.generateSampleData("line").map(e=>({...e,category:"Category B",value:.8*e.value})),...this.vega.generateSampleData("line").map(e=>({...e,category:"Category C",value:1.2*e.value}))];await this.vega.createLineChart("#multi-line-chart",t,{title:"Category Performance Over Time",xField:"date",yField:"value",categoryField:"category"})}async renderAreaChart(){let e=this.vega.generateSampleData("line");await this.vega.createAreaChart("#area-chart",e,{title:"Cumulative Sales Over Time",xField:"date",yField:"value"})}async renderScatterPlot(){let e=this.vega.generateSampleData("scatter");await this.vega.createScatterPlot("#scatter-chart",e,{title:"Price vs Sales Volume",xField:"x",yField:"y",categoryField:"category"})}async renderPieCharts(){let e=this.vega.generateSampleData("pie");await this.vega.createPieChart("#pie-chart",e,{title:"Market Share Distribution",xField:"category",yField:"value"}),await this.vega.createDonutChart("#donut-chart",e,{title:"Category Distribution",xField:"category",yField:"value"})}refreshAllCharts(){this.renderCharts()}};d=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-vega-charts-demo",standalone:!0,imports:[i.MD,l.Qp],template:`
    <div class="vega-demo">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">\u{1F4CA}</span>
            <div class="header-text">
              <h1 class="page-title">Vega Charts Gallery</h1>
              <p class="page-subtitle">Professional data visualization with Vega-Lite</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="secondary"
              icon="\u{1F504}"
              label="Refresh All"
              (click)="refreshAllCharts()"
            />
          </div>
        </div>
      </header>

      <!-- Chart Type Selector -->
      <section class="chart-selector">
        @for (chart of chartTypes; track chart.id) {
          <button
            class="selector-btn"
            [class.active]="selectedChart() === chart.id"
            (click)="selectChart(chart.id)"
          >
            <span class="selector-icon">{{ chart.icon }}</span>
            <span class="selector-label">{{ chart.label }}</span>
          </button>
        }
      </section>

      <!-- Charts Grid -->
      <section class="charts-grid">
        @if (selectedChart() === 'bar') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F4CA} Bar Chart</h3>
              <p class="chart-subtitle">Sales by Category</p>
            </div>
            <div class="chart-body">
              <div id="bar-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F4CA} Stacked Bar Chart</h3>
              <p class="chart-subtitle">Quarterly Sales by Region</p>
            </div>
            <div class="chart-body">
              <div id="stacked-bar-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F4CA} Grouped Bar Chart</h3>
              <p class="chart-subtitle">Product Comparison</p>
            </div>
            <div class="chart-body">
              <div id="grouped-bar-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'line') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F4C8} Line Chart</h3>
              <p class="chart-subtitle">Monthly Revenue Trend</p>
            </div>
            <div class="chart-body">
              <div id="line-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F4C8} Multi-Line Chart</h3>
              <p class="chart-subtitle">Category Performance Over Time</p>
            </div>
            <div class="chart-body">
              <div id="multi-line-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'area') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F30A} Area Chart</h3>
              <p class="chart-subtitle">Cumulative Sales Over Time</p>
            </div>
            <div class="chart-body">
              <div id="area-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'scatter') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u26AC Scatter Plot</h3>
              <p class="chart-subtitle">Price vs Sales Volume</p>
            </div>
            <div class="chart-body">
              <div id="scatter-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'pie') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F967} Pie Chart</h3>
              <p class="chart-subtitle">Market Share Distribution</p>
            </div>
            <div class="chart-body">
              <div id="pie-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">\u{1F369} Donut Chart</h3>
              <p class="chart-subtitle">Category Distribution</p>
            </div>
            <div class="chart-body">
              <div id="donut-chart" class="chart-container"></div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <span class="empty-icon">\u{1F4CA}</span>
            <h3>Select a chart type to view</h3>
            <p>Choose from bar, line, area, scatter, or pie charts</p>
          </div>
        }
      </section>

      <!-- Data Preview -->
      <section class="data-section">
        <div class="section-header">
          <h3 class="section-title">\u{1F4CB} Sample Data</h3>
        </div>
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                @for (col of currentDataColumns(); track col) {
                  <th>{{ col }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of currentData().slice(0, 10); track $index) {
                <tr>
                  @for (col of currentDataColumns(); track col) {
                    <td>{{ row[col] }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,styles:[`
    .vega-demo {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 40px;
    }

    .header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .chart-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .selector-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        color: #fff;
      }

      &.active {
        background: linear-gradient(135deg, #06b6d4, #3b82f6);
        border-color: transparent;
        color: #fff;
      }
    }

    .selector-icon {
      font-size: 18px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .chart-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .chart-card-large {
      grid-column: 1 / -1;
    }

    .chart-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.3);
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 4px;
    }

    .chart-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }

    .chart-body {
      padding: 20px;
    }

    .chart-container {
      width: 100%;
      min-height: 400px;
    }

    .data-section {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .section-header {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .data-table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .data-table th {
      color: #94a3b8;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      background: rgba(15, 23, 42, 0.5);
    }

    .data-table td {
      color: #e2e8f0;
      font-size: 14px;
    }

    .data-table tbody tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #94a3b8;
      grid-column: 1 / -1;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .header-content {
        flex-direction: column;
        gap: 16px;
      }
    }
  `]})],d)},3741(e,t,a){a.d(t,{E:()=>c});var s=a(9701),r=a(390),i=a(106),o=a(9582),n=a(5317),l=a(6971),d=a(1207);let c=class{constructor(){this.logger=(0,s.WQX)(n.g),this.api=(0,s.WQX)(l.G),this.comm=(0,s.WQX)(d.U),this.isConnected=(0,s.vPA)(!0),this.activeSubscriptions=(0,s.vPA)(0),this.stats=(0,s.vPA)({totalMessages:0,messagesByChannel:{},messagesByType:{},queueLength:0,broadcastCount:0,activeSubscriptions:0,stateVersion:0,lastActivity:Date.now()}),this.eventLog=(0,s.vPA)([]),this.eventName="",this.eventData="{}",this.publishing=(0,s.vPA)(!1),this.messageQueue=(0,s.vPA)([]),this.queueDestination="worker-1",this.queueData="",this.queuePriority=1,this.sharedStateList=(0,s.vPA)([]),this.stateKey="",this.stateValue="",this.broadcastLog=(0,s.vPA)([]),this.broadcastEvent="broadcast.test",this.broadcastData='{"message": "Hello everyone!"}'}ngOnInit(){this.setupEventListeners(),this.setupStateSync(),this.startStatsPolling(),this.loadQueue()}ngOnDestroy(){this.eventUnsubscribe?.(),this.broadcastUnsubscribe?.(),this.stateUnsubscribe?.(),this.statsInterval&&clearInterval(this.statsInterval)}setupEventListeners(){this.eventUnsubscribe=this.comm.subscribe("**",(e,t)=>{this.addEventLog({id:this.generateId(),event:t,data:e,timestamp:Date.now(),source:"remote"})}),this.broadcastUnsubscribe=this.comm.onBroadcast(e=>{this.broadcastLog.update(t=>[{id:this.generateId(),event:e.event,data:e.data,timestamp:Date.now(),source:"remote"},...t.slice(0,49)])}),this.stateUnsubscribe=this.comm.subscribeState((e,t)=>{this.updateStateList(),this.addEventLog({id:this.generateId(),event:"state-change",data:{key:e,value:t},timestamp:Date.now(),source:"remote"})})}setupStateSync(){this.updateStateList()}startStatsPolling(){this.statsInterval=window.setInterval(()=>{let e=this.comm.getStats();this.stats.set(e),this.activeSubscriptions.set(e.activeSubscriptions),this.updateStateList()},1e3)}updateStateList(){let e=this.comm.getAllState();this.sharedStateList.set(Object.entries(e).map(([e,t])=>({key:e,value:"object"==typeof t?JSON.stringify(t):String(t)})))}async loadQueue(){try{let e=await this.comm.dequeue();e&&this.messageQueue.update(t=>[...t,e])}catch{}}addEventLog(e){this.eventLog.update(t=>[e,...t.slice(0,99)])}formatTime(e){return new Date(e).toLocaleTimeString()}formatJson(e){try{if("string"==typeof e)return JSON.stringify(JSON.parse(e),null,2);return JSON.stringify(e,null,2)}catch{return String(e)}}formatJsonInline(e){try{if("string"==typeof e)return JSON.stringify(JSON.parse(e));return JSON.stringify(e)}catch{return String(e)}}async publishEvent(){if(!this.eventName.trim())return void this.logger.warn("Event name is required");this.publishing.set(!0);try{let e=this.eventData;try{e=JSON.parse(this.eventData)}catch{}this.addEventLog({id:this.generateId(),event:this.eventName,data:e,timestamp:Date.now(),source:"local"}),await this.comm.publish(this.eventName,e),this.logger.info(`Event published: ${this.eventName}`),this.eventName="",this.eventData="{}"}catch(e){this.logger.error("Failed to publish event",e)}finally{this.publishing.set(!1)}}quickEvent(e){let t={ping:{name:"system.ping",data:{timestamp:Date.now()}},notification:{name:"notification.show",data:{title:"Test",message:"This is a test notification"}},"state-change":{name:"state.update",data:{key:"demo",value:Math.random()}}}[e];return t?(this.eventName=t.name,this.eventData=JSON.stringify(t.data),this.publishEvent()):Promise.resolve()}clearLog(){this.eventLog.set([])}async enqueueMessage(){if(!this.queueDestination.trim()||!this.queueData.trim())return void this.logger.warn("Destination and data are required");try{await this.comm.enqueue(this.queueDestination,this.queueData,this.queuePriority),this.logger.info(`Message enqueued: ${this.queueDestination}`),this.messageQueue.update(e=>[{id:this.generateId(),channel:"message-queue",type:"request",source:"frontend",destination:this.queueDestination,timestamp:Date.now(),data:this.queueData,priority:this.queuePriority},...e.slice(0,49)]),this.queueData=""}catch(e){this.logger.error("Failed to enqueue message",e)}}async dequeueMessage(){try{let e=await this.comm.dequeue();e?this.logger.info(`Message dequeued: ${JSON.stringify(e)}`):this.logger.info("Queue is empty")}catch(e){this.logger.error("Failed to dequeue message",e)}}clearQueue(){this.comm.clearQueue(),this.messageQueue.set([]),this.logger.info("Queue cleared")}async setState(){if(!this.stateKey.trim())return void this.logger.warn("State key is required");try{await this.comm.setState(this.stateKey,this.stateValue),this.logger.info(`State set: ${this.stateKey} = ${this.stateValue}`),this.stateKey="",this.stateValue="",this.updateStateList()}catch(e){this.logger.error("Failed to set state",e)}}async syncState(){try{this.updateStateList(),this.logger.info("State synchronized")}catch(e){this.logger.error("Failed to sync state",e)}}async broadcastTest(){try{let e=this.broadcastData;try{e=JSON.parse(this.broadcastData)}catch{}await this.comm.broadcast(this.broadcastEvent,e),this.logger.info(`Broadcast sent: ${this.broadcastEvent}`),this.broadcastLog.update(t=>[{id:this.generateId(),event:this.broadcastEvent,data:e,timestamp:Date.now(),source:"local"},...t.slice(0,49)])}catch(e){this.logger.error("Failed to broadcast",e)}}generateId(){return`msg_${Date.now()}_${Math.random().toString(36).substr(2,9)}`}};c=((e,t)=>{for(var a,s=t,r=e.length-1;r>=0;r--)(a=e[r])&&(s=a(s)||s);return s})([(0,r.uAl)({selector:"app-websocket-demo",standalone:!0,imports:[i.MD,o.YN],template:`
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">\u{1F50C}</span>
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
          <div class="stat-icon">\u{1F4E8}</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().totalMessages }}</span>
            <span class="stat-label">Total Messages</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">\u{1F4EC}</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().broadcastCount }}</span>
            <span class="stat-label">Broadcasts</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">\u{1F4CB}</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().queueLength }}</span>
            <span class="stat-label">Queue Length</span>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">\u{1F504}</div>
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
              <span class="panel-icon">\u{1F4E4}</span>
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
              <span class="panel-icon">\u{1F4DC}</span>
              Event Log
            </h2>
            <button class="btn btn-sm btn-secondary" (click)="clearLog()">Clear</button>
          </div>

          <div class="panel-body panel-body-scroll">
            @if (eventLog().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">\u{1F4ED}</span>
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
              <span class="panel-icon">\u{1F4CB}</span>
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
              <span class="panel-icon">\u{1F504}</span>
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
              <span class="panel-icon">\u{1F4E2}</span>
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
  `,styles:[`
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
  `]})],c)},4253(e,t,a){a(2229),"u">typeof window&&window.WinBox?console.debug("WinBox loaded and available on window.WinBox"):console.warn("WinBox was imported but not found on window object")}},function(e){e.O(0,["132","135","184","227","229","245","301","313","34","355","389","439","454","520","577","622","625","63","666","675","686","706","760","79","823","880"],function(){return e(e.s=746)}),e.O()}]);
//# sourceMappingURL=main~2.13d167637971f62a.js.map