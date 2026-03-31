/**
 * Maps & Geographic Visualization Demo
 *
 * Demonstrates map visualization capabilities:
 * - Interactive map display
 * - Marker placement
 * - GeoJSON rendering
 * - Location search
 * - Distance calculation
 */

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { ApiService } from '../../core/api.service';

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description?: string;
}

export interface MapMarker {
  location: Location;
  color: string;
}

export interface MapStats {
  totalMarkers: number;
  categories: Record<string, number>;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

@Component({
  selector: 'app-maps-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">🗺️</span>
            Maps & Geographic Visualization
          </h1>
          <p class="demo-description">Interactive map with markers, GeoJSON, and spatial analysis</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="map-toolbar">
        <div class="toolbar-group">
          <button class="btn btn-sm btn-secondary" (click)="addRandomMarker()">
            <span>📍</span> Add Marker
          </button>
          <button class="btn btn-sm btn-secondary" (click)="clearMarkers()">
            <span>🗑️</span> Clear All
          </button>
          <button class="btn btn-sm btn-secondary" (click)="loadSampleData()">
            <span>📊</span> Load Sample
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
            <button class="search-btn" (click)="searchLocation()">🔍</button>
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
              <button class="control-btn" (click)="zoomOut()" title="Zoom Out">−</button>
              <button class="control-btn" (click)="resetView()" title="Reset View">⟲</button>
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
                  <span class="empty-icon">📭</span>
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
                    <button class="marker-delete" (click)="deleteMarker(marker.location.id)">✕</button>
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
  `]
})
export class MapsDemoComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);

  // State
  isLoading = signal(false);
  activeTab = signal<'markers' | 'stats'>('markers');
  selectedCategory = '';
  locationQuery = '';

  // Map State
  mapZoom = signal(100);
  mapBounds = signal({ north: 90, south: -90, east: 180, west: -180 });

  // Data
  markers = signal<MapMarker[]>([]);
  filteredMarkers = signal<MapMarker[]>([]);
  selectedMarker = signal<MapMarker | null>(null);

  categoryStats = signal<Record<string, number>>({});

  // Category colors
  categoryColors: Record<string, string> = {
    city: '#3b82f6',
    landmark: '#8b5cf6',
    restaurant: '#f59e0b',
    hotel: '#10b981',
    airport: '#ef4444',
  };

  categoryIcons: Record<string, string> = {
    city: '🏙️',
    landmark: '🏛️',
    restaurant: '🍽️',
    hotel: '🏨',
    airport: '✈️',
  };

  ngOnInit(): void {
    this.loadSampleData();
  }

  async loadSampleData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sample locations (converted to SVG coordinates)
      const sampleLocations: Location[] = [
        { id: '1', name: 'New York', lat: 150, lng: 220, category: 'city', description: 'The Big Apple' },
        { id: '2', name: 'London', lat: 120, lng: 480, category: 'city', description: 'Capital of UK' },
        { id: '3', name: 'Tokyo', lat: 140, lng: 820, category: 'city', description: 'Capital of Japan' },
        { id: '4', name: 'Sydney', lat: 380, lng: 840, category: 'city', description: 'Largest city in Australia' },
        { id: '5', name: 'Paris', lat: 130, lng: 500, category: 'landmark', description: 'City of Light' },
        { id: '6', name: 'Dubai', lat: 200, lng: 620, category: 'landmark', description: 'Modern metropolis' },
        { id: '7', name: 'Singapore', lat: 240, lng: 720, category: 'city', description: 'Garden City' },
        { id: '8', name: 'Rio de Janeiro', lat: 380, lng: 290, category: 'city', description: 'Marvelous City' },
        { id: '9', name: 'Cape Town', lat: 380, lng: 540, category: 'city', description: 'Mother City' },
        { id: '10', name: 'Mumbai', lat: 220, lng: 680, category: 'city', description: 'Financial capital of India' },
      ];

      this.markers.set(
        sampleLocations.map(loc => ({
          location: loc,
          color: this.categoryColors[loc.category] || '#3b82f6',
        }))
      );

      this.filterMarkers();
      this.updateStats();
      this.logger.info('Sample map data loaded');
    } catch (error) {
      this.logger.error('Failed to load map data', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  addRandomMarker(): void {
    const categories = Object.keys(this.categoryColors);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    const newLocation: Location = {
      id: `marker_${Date.now()}`,
      name: `Location ${this.markers().length + 1}`,
      lat: 100 + Math.random() * 350,
      lng: 100 + Math.random() * 750,
      category: randomCategory,
      description: 'User-added location',
    };

    this.markers.update(markers => [
      ...markers,
      { location: newLocation, color: this.categoryColors[randomCategory] },
    ]);

    this.filterMarkers();
    this.updateStats();
    this.logger.info('Marker added');
  }

  clearMarkers(): void {
    this.markers.set([]);
    this.filteredMarkers.set([]);
    this.selectedMarker.set(null);
    this.updateStats();
    this.logger.info('All markers cleared');
  }

  filterMarkers(): void {
    if (this.selectedCategory) {
      this.filteredMarkers.set(
        this.markers().filter(m => m.location.category === this.selectedCategory)
      );
    } else {
      this.filteredMarkers.set(this.markers());
    }
  }

  selectMarker(marker: MapMarker): void {
    this.selectedMarker.set(marker);
    this.logger.info(`Selected marker: ${marker.location.name}`);
  }

  deleteMarker(id: string): void {
    this.markers.update(markers => markers.filter(m => m.location.id !== id));
    if (this.selectedMarker()?.location.id === id) {
      this.selectedMarker.set(null);
    }
    this.filterMarkers();
    this.updateStats();
    this.logger.info('Marker deleted');
  }

  searchLocation(): void {
    if (!this.locationQuery.trim()) {
      return;
    }

    const query = this.locationQuery.toLowerCase();
    const found = this.markers().find(
      m => m.location.name.toLowerCase().includes(query)
    );

    if (found) {
      this.selectMarker(found);
      this.logger.info(`Found location: ${found.location.name}`);
    } else {
      this.logger.warn('Location not found');
    }
  }

  zoomIn(): void {
    this.mapZoom.update(z => Math.min(z + 20, 200));
  }

  zoomOut(): void {
    this.mapZoom.update(z => Math.max(z - 20, 50));
  }

  resetView(): void {
    this.mapZoom.set(100);
    this.selectedMarker.set(null);
  }

  getCategoryIcon(category: string): string {
    return this.categoryIcons[category] || '📍';
  }

  updateStats(): void {
    const stats: Record<string, number> = {};
    this.markers().forEach(marker => {
      const cat = marker.location.category;
      stats[cat] = (stats[cat] || 0) + 1;
    });
    this.categoryStats.set(stats);
  }
}
