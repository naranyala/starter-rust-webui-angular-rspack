/**
 * Vega Charts Service
 * 
 * Provides chart rendering capabilities using Vega-Lite.
 * Supports multiple chart types with consistent API.
 * 
 * @example
 * ```typescript
 * // Create a bar chart
 * vegaService.createBarChart('#chart-container', data, {
 *   xField: 'category',
 *   yField: 'value',
 *   title: 'Sales by Category'
 * });
 * 
 * // Create a line chart
 * vegaService.createLineChart('#chart-container', timeSeriesData, {
 *   xField: 'date',
 *   yField: 'value',
 *   title: 'Trend Over Time'
 * });
 * ```
 */

import { Injectable, inject } from '@angular/core';
import { LoggerService } from './logger.service';
import type { TopLevelSpec } from 'vega-lite';

// Dynamic import for vega-embed (ESM module)
type VegaEmbed = (container: string | HTMLElement, spec: TopLevelSpec, options?: any) => Promise<any>;
let vegaEmbed: VegaEmbed | null = null;

async function getVegaEmbed(): Promise<VegaEmbed> {
  if (!vegaEmbed) {
    const module = await import('vega-embed');
    vegaEmbed = module.default as VegaEmbed;
  }
  return vegaEmbed;
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChartConfig {
  title?: string;
  width?: number;
  height?: number;
  color?: string;
  xField?: string;
  yField?: string;
  categoryField?: string;
  tooltip?: string[];
}

export interface ChartDataPoint {
  [key: string]: unknown;
}

export type ChartType = 'bar' | 'line' | 'area' | 'scatter' | 'pie' | 'donut' | 'stacked-bar' | 'grouped-bar';

// ============================================================================
// Vega Service
// ============================================================================

@Injectable({ providedIn: 'root' })
export class VegaService {
  private readonly logger = inject(LoggerService);

  /**
   * Render a Vega-Lite specification
   */
  async renderChart(
    container: string | HTMLElement,
    spec: TopLevelSpec,
    options?: { actions?: boolean; renderer?: 'canvas' | 'svg' }
  ): Promise<void> {
    try {
      const embed = await getVegaEmbed();
      await embed(container, spec, {
        actions: options?.actions ?? false,
        renderer: options?.renderer ?? 'svg',
        theme: 'dark',
      });
      this.logger.info('Chart rendered successfully', container);
    } catch (error) {
      this.logger.error('Failed to render chart', error);
      throw error;
    }
  }

  /**
   * Create a bar chart
   */
  async createBarChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'bar', cornerRadius: 4 },
      encoding: {
        x: {
          field: config.xField,
          type: 'nominal',
          axis: { labelAngle: -45, labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        color: {
          field: config.categoryField || config.xField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a line chart
   */
  async createLineChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'line', strokeWidth: 3, point: { filled: true, fill: config.color || '#06b6d4' } },
      encoding: {
        x: {
          field: config.xField,
          type: 'temporal',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        color: {
          field: config.categoryField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create an area chart
   */
  async createAreaChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'area', opacity: 0.7 },
      encoding: {
        x: {
          field: config.xField,
          type: 'temporal',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        color: { value: config.color || '#06b6d4' },
        tooltip: config.tooltip || [config.xField!, config.yField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a scatter plot
   */
  async createScatterPlot(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'point', filled: true, size: 100 },
      encoding: {
        x: {
          field: config.xField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        color: {
          field: config.categoryField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        size: { value: 100 },
        tooltip: config.tooltip || [config.xField!, config.yField!, config.categoryField!].filter(Boolean) as string[],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a pie chart
   */
  async createPieChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 400,
      height: config.height || 400,
      mark: { type: 'arc', innerRadius: 0 },
      encoding: {
        theta: {
          field: config.yField,
          type: 'quantitative',
        },
        color: {
          field: config.xField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a donut chart
   */
  async createDonutChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 400,
      height: config.height || 400,
      mark: { type: 'arc', innerRadius: 80 },
      encoding: {
        theta: {
          field: config.yField,
          type: 'quantitative',
        },
        color: {
          field: config.xField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a stacked bar chart
   */
  async createStackedBarChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'bar', cornerRadius: 4 },
      encoding: {
        x: {
          field: config.xField,
          type: 'nominal',
          axis: { labelAngle: -45, labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          stack: 'zero',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        color: {
          field: config.categoryField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!, config.categoryField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Create a grouped bar chart
   */
  async createGroupedBarChart(
    container: string | HTMLElement,
    data: ChartDataPoint[],
    config: ChartConfig
  ): Promise<void> {
    const spec: TopLevelSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: { values: data },
      title: config.title,
      width: config.width || 'container',
      height: config.height || 400,
      mark: { type: 'bar', cornerRadius: 4 },
      encoding: {
        x: {
          field: config.xField,
          type: 'nominal',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        y: {
          field: config.yField,
          type: 'quantitative',
          axis: { labelColor: '#94a3b8', tickColor: '#475569' },
        },
        xOffset: {
          field: config.categoryField,
          type: 'nominal',
        },
        color: {
          field: config.categoryField,
          type: 'nominal',
          scale: { scheme: 'category10' },
        },
        tooltip: config.tooltip || [config.xField!, config.yField!, config.categoryField!],
      },
    };

    await this.renderChart(container, spec);
  }

  /**
   * Clear a chart container
   */
  clearChart(container: string | HTMLElement): void {
    const element = typeof container === 'string' ? document.querySelector(container) : container;
    if (element) {
      element.innerHTML = '';
    }
  }

  /**
   * Generate sample data for testing
   */
  generateSampleData(type: ChartType): ChartDataPoint[] {
    switch (type) {
      case 'bar':
        return [
          { category: 'Electronics', value: 4500 },
          { category: 'Clothing', value: 3200 },
          { category: 'Books', value: 2100 },
          { category: 'Home', value: 3800 },
          { category: 'Sports', value: 2900 },
        ];

      case 'line':
        return Array.from({ length: 12 }, (_, i) => ({
          date: new Date(2024, i, 1),
          value: Math.floor(Math.random() * 5000) + 2000,
        }));

      case 'scatter':
        return Array.from({ length: 50 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        }));

      case 'pie':
      case 'donut':
        return [
          { category: 'Product A', value: 35 },
          { category: 'Product B', value: 25 },
          { category: 'Product C', value: 20 },
          { category: 'Product D', value: 15 },
          { category: 'Product E', value: 5 },
        ];

      default:
        return [];
    }
  }
}
