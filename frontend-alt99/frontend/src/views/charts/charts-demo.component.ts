/**
 * Charts & Data Visualization Demo
 *
 * Demonstrates chart visualization using SVG.js:
 * - Bar charts
 * - Line charts
 * - Pie charts
 * - Area charts
 * - Real-time data updates
 */

import { Component, signal, inject, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../core/logger.service';
import { ApiService } from '../../core/api.service';
import SVG from 'svg.js';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: ChartData[];
  width: number;
  height: number;
}

@Component({
  selector: 'app-charts-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">📈</span>
            Charts & Data Visualization
          </h1>
          <p class="demo-description">Interactive charts built with SVG.js</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshData()">
            <span>🔄</span> Refresh Data
          </button>
        </div>
      </div>

      <!-- Chart Type Selector -->
      <div class="chart-selector">
        <button
          class="selector-btn"
          [class.active]="selectedChartType() === 'bar'"
          (click)="selectedChartType.set('bar')"
        >
          Bar Chart
        </button>
        <button
          class="selector-btn"
          [class.active]="selectedChartType() === 'line'"
          (click)="selectedChartType.set('line')"
        >
          Line Chart
        </button>
        <button
          class="selector-btn"
          [class.active]="selectedChartType() === 'pie'"
          (click)="selectedChartType.set('pie')"
        >
          Pie Chart
        </button>
        <button
          class="selector-btn"
          [class.active]="selectedChartType() === 'area'"
          (click)="selectedChartType.set('area')"
        >
          Area Chart
        </button>
      </div>

      <!-- Main Charts Grid -->
      <div class="charts-grid">
        <!-- Primary Chart -->
        <div class="chart-card chart-card-large">
          <div class="chart-header">
            <h2 class="chart-title">Primary Visualization</h2>
            <div class="chart-controls">
              <button class="btn-icon" (click)="toggleAnimation()" title="Toggle Animation">
                {{ animate() ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>
          <div class="chart-body">
            <div #primaryChart class="chart-canvas"></div>
          </div>
        </div>

        <!-- Secondary Chart -->
        <div class="chart-card chart-card-large">
          <div class="chart-header">
            <h2 class="chart-title">Secondary Visualization</h2>
          </div>
          <div class="chart-body">
            <div #secondaryChart class="chart-canvas"></div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Total Value</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <span class="stat-value">{{ maxValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Max Value</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">📉</div>
          <div class="stat-content">
            <span class="stat-value">{{ minValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Min Value</span>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">🔢</div>
          <div class="stat-content">
            <span class="stat-value">{{ avgValue() | number:'1.0-2' }}</span>
            <span class="stat-label">Average</span>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="data-panel">
        <div class="panel-header">
          <h2 class="panel-title">Data Points</h2>
          <button class="btn btn-sm btn-secondary" (click)="addRandomData()">Add Point</button>
        </div>
        <div class="panel-body">
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Value</th>
                  <th>Percentage</th>
                  <th>Color</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (item of chartData(); track item.label) {
                  <tr>
                    <td>
                      <span class="label-badge" [style.background]="item.color">{{ item.label }}</span>
                    </td>
                    <td class="value-cell">{{ item.value | number:'1.0-0' }}</td>
                    <td>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          [style.width.%]="getPercentage(item.value)"
                          [style.background]="item.color">
                        </div>
                      </div>
                      <span class="percentage-text">{{ getPercentage(item.value) | number:'1.1' }}%</span>
                    </td>
                    <td>
                      <input
                        type="color"
                        class="color-picker"
                        [value]="item.color"
                        (change)="updateColor(item, $event)"
                      />
                    </td>
                    <td>
                      <button class="btn-icon btn-delete" (click)="removeData(item.label)" title="Remove">
                        🗑️
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .chart-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .selector-btn {
      padding: 10px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .selector-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .selector-btn.active {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-color: transparent;
      color: #fff;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    .chart-card-large {
      grid-column: span 1;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .chart-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .chart-controls {
      display: flex;
      gap: 8px;
    }

    .chart-body {
      padding: 20px;
    }

    .chart-canvas {
      width: 100%;
      height: 300px;
    }

    .stats-grid {
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

    .data-panel {
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
    }

    .panel-body {
      padding: 20px;
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
    }

    .data-table td {
      color: #e2e8f0;
      font-size: 14px;
    }

    .label-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      color: #fff;
    }

    .value-cell {
      font-weight: 600;
      color: #fff;
    }

    .progress-bar {
      display: inline-block;
      width: 100px;
      height: 8px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 4px;
      overflow: hidden;
      vertical-align: middle;
      margin-right: 8px;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s;
    }

    .percentage-text {
      font-size: 12px;
      color: #94a3b8;
    }

    .color-picker {
      width: 40px;
      height: 30px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: transparent;
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

    .btn-secondary {
      background: rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(148, 163, 184, 0.3);
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }

    .btn-icon {
      padding: 6px 10px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: rgba(148, 163, 184, 0.1);
    }

    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    @media (max-width: 1200px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      .chart-card-large {
        grid-column: 1 / -1;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .demo-header {
        flex-direction: column;
        gap: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .chart-selector {
        overflow-x: auto;
      }
    }
  `]
})
export class ChartsDemoComponent implements OnInit, AfterViewInit {
  private readonly logger = inject(LoggerService);
  private readonly api = inject(ApiService);

  @ViewChild('primaryChart') primaryChartRef!: ElementRef;
  @ViewChild('secondaryChart') secondaryChartRef!: ElementRef;

  // Chart State
  selectedChartType = signal<'bar' | 'line' | 'pie' | 'area'>('bar');
  animate = signal(true);
  animationFrame?: number;

  // Data
  chartData = signal<ChartData[]>([
    { label: 'Jan', value: 4500, color: '#06b6d4' },
    { label: 'Feb', value: 5200, color: '#3b82f6' },
    { label: 'Mar', value: 4800, color: '#8b5cf6' },
    { label: 'Apr', value: 6100, color: '#10b981' },
    { label: 'May', value: 5900, color: '#f59e0b' },
    { label: 'Jun', value: 7200, color: '#ef4444' },
  ]);

  // Computed Stats
  totalValue = signal(0);
  maxValue = signal(0);
  minValue = signal(0);
  avgValue = signal(0);

  // SVG instances
  private primaryDraw?: any;
  private secondaryDraw?: any;

  ngOnInit(): void {
    this.calculateStats();
  }

  ngAfterViewInit(): void {
    this.initCharts();
    this.renderCharts();
  }

  initCharts(): void {
    if (this.primaryChartRef?.nativeElement) {
      this.primaryDraw = SVG().addTo(this.primaryChartRef.nativeElement).size('100%', '100%');
    }
    if (this.secondaryChartRef?.nativeElement) {
      this.secondaryDraw = SVG().addTo(this.secondaryChartRef.nativeElement).size('100%', '100%');
    }
  }

  renderCharts(): void {
    this.clearCharts();
    const type = this.selectedChartType();

    if (type === 'bar') {
      this.renderBarChart();
      this.renderBarChartSecondary();
    } else if (type === 'line') {
      this.renderLineChart();
      this.renderAreaChartSecondary();
    } else if (type === 'pie') {
      this.renderPieChart();
      this.renderDonutChartSecondary();
    } else if (type === 'area') {
      this.renderAreaChart();
      this.renderStackedAreaSecondary();
    }
  }

  clearCharts(): void {
    if (this.primaryDraw) {
      this.primaryDraw.clear();
    }
    if (this.secondaryDraw) {
      this.secondaryDraw.clear();
    }
  }

  renderBarChart(): void {
    if (!this.primaryDraw) return;

    const data = this.chartData();
    const width = this.primaryDraw.width() || 600;
    const height = this.primaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length - 10;

    // Draw axes
    this.primaryDraw.line(padding, padding, padding, height - padding).stroke({ width: 2, color: '#475569' });
    this.primaryDraw.line(padding, height - padding, width - padding, height - padding).stroke({ width: 2, color: '#475569' });

    // Draw bars
    data.forEach((item, i) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + i * (barWidth + 10) + 5;
      const y = height - padding - barHeight;

      const bar = this.primaryDraw.rect(barWidth, this.animate() ? 0 : barHeight);
      bar.fill(item.color);
      bar.move(x, this.animate() ? height - padding : y);

      if (this.animate()) {
        bar.animate(1000).size(barWidth, barHeight).move(x, y);
      }

      // Draw label
      this.primaryDraw.text(item.label).fill('#94a3b8').font('size', 12).move(x + barWidth / 2 - 10, height - padding + 10);

      // Draw value
      this.primaryDraw.text(item.value.toString()).fill('#fff').font('size', 11).move(x + barWidth / 2 - 15, y - 5);
    });
  }

  renderBarChartSecondary(): void {
    if (!this.secondaryDraw) return;

    const data = this.chartData().slice(0, 4);
    const width = this.secondaryDraw.width() || 600;
    const height = this.secondaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length - 10;

    // Draw horizontal bars
    data.forEach((item, i) => {
      const barHeight = 30;
      const barWidth = (item.value / maxValue) * chartWidth;
      const x = padding;
      const y = padding + i * (barHeight + 15);

      const bar = this.secondaryDraw.rect(this.animate() ? 0 : barWidth, barHeight);
      bar.fill(item.color).move(x, y);

      if (this.animate()) {
        bar.animate(800).size(barWidth, barHeight);
      }

      // Label
      this.secondaryDraw.text(item.label).fill('#fff').font('size', 13).move(padding - 5, y + 8);

      // Value
      this.secondaryDraw.text(item.value.toString()).fill('#94a3b8').font('size', 12).move(x + barWidth + 10, y + 8);
    });
  }

  renderLineChart(): void {
    if (!this.primaryDraw) return;

    const data = this.chartData();
    const width = this.primaryDraw.width() || 600;
    const height = this.primaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Draw axes
    this.primaryDraw.line(padding, padding, padding, height - padding).stroke({ width: 2, color: '#475569' });
    this.primaryDraw.line(padding, height - padding, width - padding, height - padding).stroke({ width: 2, color: '#475569' });

    // Calculate points
    const points = data.map((item, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - ((item.value - minValue) / range) * chartHeight;
      return { x, y, ...item };
    });

    // Draw line
    if (points.length > 1) {
      const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
      const polyline = this.primaryDraw.polyline(linePoints).fill('none').stroke({ width: 3, color: '#06b6d4' });

      if (this.animate()) {
        polyline.animate(1500).stroke({ width: 3, color: '#06b6d4' });
      }

      // Draw points
      points.forEach((point, i) => {
        const circle = this.primaryDraw.circle(8).fill(point.color).move(point.x - 4, point.y - 4);
        if (this.animate()) {
          circle.animate(500).delay(i * 100).size(8, 8).move(point.x - 4, point.y - 4);
        }
      });
    }

    // Draw labels
    data.forEach((item, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      this.primaryDraw.text(item.label).fill('#94a3b8').font('size', 12).move(x - 10, height - padding + 10);
    });
  }

  renderAreaChartSecondary(): void {
    if (!this.secondaryDraw) return;

    const data = this.chartData().slice(0, 5);
    const width = this.secondaryDraw.width() || 600;
    const height = this.secondaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));

    // Calculate points
    const points = data.map((item, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - (item.value / maxValue) * chartHeight;
      return { x, y };
    });

    // Create area path
    if (points.length > 1) {
      const areaPath = `M ${padding},${height - padding} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${padding + chartWidth},${height - padding} Z`;
      const area = this.secondaryDraw.path(areaPath).fill('#06b6d4').opacity(0.3);

      if (this.animate()) {
        area.animate(1500).opacity(0.3);
      }

      // Draw line
      const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
      this.secondaryDraw.polyline(linePoints).fill('none').stroke({ width: 2, color: '#06b6d4' });
    }
  }

  renderPieChart(): void {
    if (!this.primaryDraw) return;

    const data = this.chartData();
    const width = this.primaryDraw.width() || 600;
    const height = this.primaryDraw.height() || 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let startAngle = -90;

    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 360;
      const endAngle = startAngle + sliceAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
      const slice = this.primaryDraw.path(pathData).fill(item.color);

      if (this.animate()) {
        slice.animate(800).delay(i * 100).fill(item.color);
      }

      startAngle = endAngle;
    });
  }

  renderDonutChartSecondary(): void {
    if (!this.secondaryDraw) return;

    const data = this.chartData().slice(0, 5);
    const width = this.secondaryDraw.width() || 600;
    const height = this.secondaryDraw.height() || 300;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 40;
    const innerRadius = outerRadius * 0.6;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let startAngle = -90;

    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * 360;
      const endAngle = startAngle + sliceAngle;

      const startRadOuter = (startAngle * Math.PI) / 180;
      const endRadOuter = (endAngle * Math.PI) / 180;
      const startRadInner = (endAngle * Math.PI) / 180;
      const endRadInner = (startAngle * Math.PI) / 180;

      const x1 = centerX + outerRadius * Math.cos(startRadOuter);
      const y1 = centerY + outerRadius * Math.sin(startRadOuter);
      const x2 = centerX + outerRadius * Math.cos(endRadOuter);
      const y2 = centerY + outerRadius * Math.sin(endRadOuter);
      const x3 = centerX + innerRadius * Math.cos(startRadInner);
      const y3 = centerY + innerRadius * Math.sin(startRadInner);
      const x4 = centerX + innerRadius * Math.cos(endRadInner);
      const y4 = centerY + innerRadius * Math.sin(endRadInner);

      const pathData = `M ${x1},${y1} A ${outerRadius},${outerRadius} 0 0 1 ${x2},${y2} L ${x4},${y4} A ${innerRadius},${innerRadius} 0 0 0 ${x3},${y3} Z`;
      const slice = this.secondaryDraw.path(pathData).fill(item.color);

      if (this.animate()) {
        slice.animate(800).delay(i * 100).fill(item.color);
      }

      startAngle = endAngle;
    });
  }

  renderAreaChart(): void {
    if (!this.primaryDraw) return;

    const data = this.chartData();
    const width = this.primaryDraw.width() || 600;
    const height = this.primaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...data.map(d => d.value));

    // Calculate points
    const points = data.map((item, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = height - padding - (item.value / maxValue) * chartHeight;
      return { x, y, ...item };
    });

    // Create area path
    if (points.length > 1) {
      const areaPath = `M ${padding},${height - padding} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${padding + chartWidth},${height - padding} Z`;
      const gradient = this.primaryDraw.gradient('linear').from(0, 0).to(0, 1);
      gradient.at(0, '#06b6d4', 0.8);
      gradient.at(1, '#06b6d4', 0.1);

      const area = this.primaryDraw.path(areaPath).fill(gradient);

      if (this.animate()) {
        area.animate(1500).opacity(1);
      }

      // Draw line
      const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
      this.primaryDraw.polyline(linePoints).fill('none').stroke({ width: 3, color: '#06b6d4' });

      // Draw points
      points.forEach((point, i) => {
        const circle = this.primaryDraw.circle(6).fill(point.color).move(point.x - 3, point.y - 3);
        if (this.animate()) {
          circle.animate(500).delay(i * 100).size(6, 6).move(point.x - 3, point.y - 3);
        }
      });
    }

    // Draw labels
    data.forEach((item, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      this.primaryDraw.text(item.label).fill('#94a3b8').font('size', 12).move(x - 10, height - padding + 10);
    });
  }

  renderStackedAreaSecondary(): void {
    if (!this.secondaryDraw) return;

    const data = this.chartData().slice(0, 4);
    const width = this.secondaryDraw.width() || 600;
    const height = this.secondaryDraw.height() || 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    let yOffset = height - padding;

    data.forEach((item, i) => {
      const segmentHeight = (item.value / total) * chartHeight;
      const y = yOffset - segmentHeight;

      const rect = this.secondaryDraw.rect(chartWidth, this.animate() ? 0 : segmentHeight);
      rect.fill(item.color).move(padding, this.animate() ? yOffset : y);

      if (this.animate()) {
        rect.animate(800).delay(i * 100).size(chartWidth, segmentHeight).move(padding, y);
      }

      // Label
      this.secondaryDraw.text(item.label).fill('#fff').font('size', 12).move(padding + 10, y + segmentHeight / 2 + 4);

      yOffset = y;
    });
  }

  calculateStats(): void {
    const data = this.chartData();
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const avg = total / data.length;

    this.totalValue.set(total);
    this.maxValue.set(max);
    this.minValue.set(min);
    this.avgValue.set(avg);
  }

  getPercentage(value: number): number {
    const total = this.totalValue();
    return total > 0 ? (value / total) * 100 : 0;
  }

  toggleAnimation(): void {
    this.animate.update(a => !a);
    if (this.animate()) {
      this.renderCharts();
    }
  }

  refreshData(): void {
    this.chartData.update(data =>
      data.map(item => ({
        ...item,
        value: Math.floor(item.value * (0.8 + Math.random() * 0.4)),
      }))
    );
    this.calculateStats();
    setTimeout(() => this.renderCharts(), 100);
  }

  addRandomData(): void {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    const newLabel = months[Math.floor(Math.random() * months.length)];
    const newValue = Math.floor(3000 + Math.random() * 5000);
    const newColor = colors[Math.floor(Math.random() * colors.length)];

    this.chartData.update(data => [...data, { label: newLabel, value: newValue, color: newColor }]);
    this.calculateStats();
    setTimeout(() => this.renderCharts(), 100);
  }

  removeData(label: string): void {
    if (this.chartData().length <= 2) {
      this.logger.warn('Minimum 2 data points required');
      return;
    }

    this.chartData.update(data => data.filter(item => item.label !== label));
    this.calculateStats();
    setTimeout(() => this.renderCharts(), 100);
  }

  updateColor(item: ChartData, event: Event): void {
    const target = event.target as HTMLInputElement;
    item.color = target.value;
    this.chartData.update(data => [...data]);
    setTimeout(() => this.renderCharts(), 100);
  }
}
