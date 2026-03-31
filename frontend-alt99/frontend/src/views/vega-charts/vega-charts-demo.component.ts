/**
 * Vega Charts Demo - Main Container
 * 
 * Showcases multiple Vega-Lite chart types:
 * - Bar charts
 * - Line charts
 * - Area charts
 * - Scatter plots
 * - Pie/Donut charts
 * - Stacked/Grouped bar charts
 */

import { Component, signal, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VegaService, ChartDataPoint } from '../../core/vega.service';
import { LoggerService } from '../../core/logger.service';
import { ButtonComponent } from '../shared/ui';

@Component({
  selector: 'app-vega-charts-demo',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="vega-demo">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">📊</span>
            <div class="header-text">
              <h1 class="page-title">Vega Charts Gallery</h1>
              <p class="page-subtitle">Professional data visualization with Vega-Lite</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="secondary"
              icon="🔄"
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
              <h3 class="chart-title">📊 Bar Chart</h3>
              <p class="chart-subtitle">Sales by Category</p>
            </div>
            <div class="chart-body">
              <div id="bar-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">📊 Stacked Bar Chart</h3>
              <p class="chart-subtitle">Quarterly Sales by Region</p>
            </div>
            <div class="chart-body">
              <div id="stacked-bar-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">📊 Grouped Bar Chart</h3>
              <p class="chart-subtitle">Product Comparison</p>
            </div>
            <div class="chart-body">
              <div id="grouped-bar-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'line') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">📈 Line Chart</h3>
              <p class="chart-subtitle">Monthly Revenue Trend</p>
            </div>
            <div class="chart-body">
              <div id="line-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">📈 Multi-Line Chart</h3>
              <p class="chart-subtitle">Category Performance Over Time</p>
            </div>
            <div class="chart-body">
              <div id="multi-line-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'area') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">🌊 Area Chart</h3>
              <p class="chart-subtitle">Cumulative Sales Over Time</p>
            </div>
            <div class="chart-body">
              <div id="area-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'scatter') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">⚬ Scatter Plot</h3>
              <p class="chart-subtitle">Price vs Sales Volume</p>
            </div>
            <div class="chart-body">
              <div id="scatter-chart" class="chart-container"></div>
            </div>
          </div>
        } @else if (selectedChart() === 'pie') {
          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">🥧 Pie Chart</h3>
              <p class="chart-subtitle">Market Share Distribution</p>
            </div>
            <div class="chart-body">
              <div id="pie-chart" class="chart-container"></div>
            </div>
          </div>

          <div class="chart-card chart-card-large">
            <div class="chart-header">
              <h3 class="chart-title">🍩 Donut Chart</h3>
              <p class="chart-subtitle">Category Distribution</p>
            </div>
            <div class="chart-body">
              <div id="donut-chart" class="chart-container"></div>
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <span class="empty-icon">📊</span>
            <h3>Select a chart type to view</h3>
            <p>Choose from bar, line, area, scatter, or pie charts</p>
          </div>
        }
      </section>

      <!-- Data Preview -->
      <section class="data-section">
        <div class="section-header">
          <h3 class="section-title">📋 Sample Data</h3>
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
  `,
  styles: [`
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
  `]
})
export class VegaChartsDemoComponent implements OnInit, AfterViewInit {
  private readonly vega = inject(VegaService);
  private readonly logger = inject(LoggerService);

  readonly chartTypes = [
    { id: 'bar', label: 'Bar Charts', icon: '📊' },
    { id: 'line', label: 'Line Charts', icon: '📈' },
    { id: 'area', label: 'Area Charts', icon: '🌊' },
    { id: 'scatter', label: 'Scatter Plot', icon: '⚬' },
    { id: 'pie', label: 'Pie/Donut', icon: '🥧' },
  ];

  selectedChart = signal<string>('bar');
  currentData = signal<ChartDataPoint[]>([]);
  currentDataColumns = signal<string[]>([]);

  ngOnInit(): void {
    this.selectChart('bar');
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 100);
  }

  selectChart(chartId: string): void {
    this.selectedChart.set(chartId);
    this.generateDataForChart(chartId);
  }

  generateDataForChart(chartId: string): void {
    switch (chartId) {
      case 'bar':
        this.currentData.set(this.vega.generateSampleData('bar'));
        this.currentDataColumns.set(['category', 'value']);
        break;
      case 'line':
        this.currentData.set(this.vega.generateSampleData('line'));
        this.currentDataColumns.set(['date', 'value']);
        break;
      case 'area':
        this.currentData.set(this.vega.generateSampleData('line'));
        this.currentDataColumns.set(['date', 'value']);
        break;
      case 'scatter':
        this.currentData.set(this.vega.generateSampleData('scatter'));
        this.currentDataColumns.set(['x', 'y', 'category']);
        break;
      case 'pie':
        this.currentData.set(this.vega.generateSampleData('pie'));
        this.currentDataColumns.set(['category', 'value']);
        break;
    }
  }

  async renderCharts(): Promise<void> {
    const chartId = this.selectedChart();
    
    // Clear existing charts
    document.querySelectorAll('.chart-container').forEach(el => {
      el.innerHTML = '';
    });

    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      switch (chartId) {
        case 'bar':
          await this.renderBarCharts();
          break;
        case 'line':
          await this.renderLineCharts();
          break;
        case 'area':
          await this.renderAreaChart();
          break;
        case 'scatter':
          await this.renderScatterPlot();
          break;
        case 'pie':
          await this.renderPieCharts();
          break;
      }
      this.logger.info(`Rendered ${chartId} charts successfully`);
    } catch (error) {
      this.logger.error('Failed to render charts', error);
    }
  }

  async renderBarCharts(): Promise<void> {
    const barData = this.vega.generateSampleData('bar');
    
    // Simple bar chart
    await this.vega.createBarChart('#bar-chart', barData, {
      title: 'Sales by Category',
      xField: 'category',
      yField: 'value',
    });

    // Stacked bar chart
    const stackedData = [
      { quarter: 'Q1', region: 'North', sales: 4000 },
      { quarter: 'Q1', region: 'South', sales: 3000 },
      { quarter: 'Q1', region: 'East', sales: 2000 },
      { quarter: 'Q1', region: 'West', sales: 3500 },
      { quarter: 'Q2', region: 'North', sales: 4500 },
      { quarter: 'Q2', region: 'South', sales: 3200 },
      { quarter: 'Q2', region: 'East', sales: 2300 },
      { quarter: 'Q2', region: 'West', sales: 3800 },
      { quarter: 'Q3', region: 'North', sales: 4200 },
      { quarter: 'Q3', region: 'South', sales: 3500 },
      { quarter: 'Q3', region: 'East', sales: 2100 },
      { quarter: 'Q3', region: 'West', sales: 4000 },
      { quarter: 'Q4', region: 'North', sales: 5000 },
      { quarter: 'Q4', region: 'South', sales: 4000 },
      { quarter: 'Q4', region: 'East', sales: 2800 },
      { quarter: 'Q4', region: 'West', sales: 4500 },
    ];

    await this.vega.createStackedBarChart('#stacked-bar-chart', stackedData, {
      title: 'Quarterly Sales by Region',
      xField: 'quarter',
      yField: 'sales',
      categoryField: 'region',
    });

    // Grouped bar chart
    const groupedData = [
      { product: 'Product A', year: '2022', sales: 4000 },
      { product: 'Product A', year: '2023', sales: 4500 },
      { product: 'Product A', year: '2024', sales: 5000 },
      { product: 'Product B', year: '2022', sales: 3000 },
      { product: 'Product B', year: '2023', sales: 3500 },
      { product: 'Product B', year: '2024', sales: 4000 },
      { product: 'Product C', year: '2022', sales: 2000 },
      { product: 'Product C', year: '2023', sales: 2500 },
      { product: 'Product C', year: '2024', sales: 3000 },
    ];

    await this.vega.createGroupedBarChart('#grouped-bar-chart', groupedData, {
      title: 'Product Sales Comparison',
      xField: 'product',
      yField: 'sales',
      categoryField: 'year',
    });
  }

  async renderLineCharts(): Promise<void> {
    const lineData = this.vega.generateSampleData('line');
    
    // Simple line chart
    await this.vega.createLineChart('#line-chart', lineData, {
      title: 'Monthly Revenue Trend',
      xField: 'date',
      yField: 'value',
    });

    // Multi-line chart
    const multiLineData = [
      ...this.vega.generateSampleData('line').map(d => ({ ...d, category: 'Category A' })),
      ...this.vega.generateSampleData('line').map(d => ({ ...d, category: 'Category B', value: d.value * 0.8 })),
      ...this.vega.generateSampleData('line').map(d => ({ ...d, category: 'Category C', value: d.value * 1.2 })),
    ];

    await this.vega.createLineChart('#multi-line-chart', multiLineData, {
      title: 'Category Performance Over Time',
      xField: 'date',
      yField: 'value',
      categoryField: 'category',
    });
  }

  async renderAreaChart(): Promise<void> {
    const areaData = this.vega.generateSampleData('line');
    
    await this.vega.createAreaChart('#area-chart', areaData, {
      title: 'Cumulative Sales Over Time',
      xField: 'date',
      yField: 'value',
    });
  }

  async renderScatterPlot(): Promise<void> {
    const scatterData = this.vega.generateSampleData('scatter');
    
    await this.vega.createScatterPlot('#scatter-chart', scatterData, {
      title: 'Price vs Sales Volume',
      xField: 'x',
      yField: 'y',
      categoryField: 'category',
    });
  }

  async renderPieCharts(): Promise<void> {
    const pieData = this.vega.generateSampleData('pie');
    
    // Pie chart
    await this.vega.createPieChart('#pie-chart', pieData, {
      title: 'Market Share Distribution',
      xField: 'category',
      yField: 'value',
    });

    // Donut chart
    await this.vega.createDonutChart('#donut-chart', pieData, {
      title: 'Category Distribution',
      xField: 'category',
      yField: 'value',
    });
  }

  refreshAllCharts(): void {
    this.renderCharts();
  }
}
