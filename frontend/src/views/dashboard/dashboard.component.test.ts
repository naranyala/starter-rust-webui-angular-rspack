/**
 * Dashboard Component Tests
 *
 * Tests for the main dashboard component including:
 * - Navigation and view switching
 * - Mobile responsiveness
 * - Data loading
 * - Section toggling
 */

import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarkdownModule } from 'ngx-markdown';
import { DashboardComponent, NavItem } from './dashboard.component';
import { ApiService } from '../../core/api.service';
import { LoggerService } from '../../core/logger.service';

// Mock services
class MockApiService {
  callOrThrow<T>(functionName: string, args: unknown[] = []): Promise<T> {
    return Promise.resolve({} as T);
  }
}

class MockLoggerService {
  info(message: string, ...args: unknown[]): void {}
  warn(message: string, ...args: unknown[]): void {}
  error(message: string, ...args: unknown[]): void {}
  debug(message: string, ...args: unknown[]): void {}
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: jasmine.SpyObj<ApiService>;
  let loggerService: jasmine.SpyObj<LoggerService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        MarkdownModule.forChild(),
      ],
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: LoggerService, useClass: MockLoggerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    // Get spy references
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    loggerService = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with README as active view', () => {
    expect(component.activeView()).toBe('README');
  });

  it('should have docs section open by default', () => {
    expect(component.docsOpen()).toBeTrue();
  });

  it('should have demo section open by default', () => {
    expect(component.demoOpen()).toBeTrue();
  });

  it('should have 12 doc items', () => {
    expect(component.docItems().length).toBe(12);
  });

  it('should have 6 demo items', () => {
    expect(component.demoItems().length).toBe(6);
  });

  it('should have correct first doc item', () => {
    const firstItem = component.docItems()[0];
    expect(firstItem.id).toBe('README');
    expect(firstItem.label).toBe('Overview');
    expect(firstItem.icon).toBe('📖');
  });

  it('should have correct first demo item', () => {
    const firstDemoItem = component.demoItems()[0];
    expect(firstDemoItem.id).toBe('demo_duckdb');
    expect(firstDemoItem.label).toBe('DuckDB');
    expect(firstDemoItem.icon).toBe('🦆');
  });

  it('should initialize with empty data arrays', () => {
    expect(component.users().length).toBe(0);
    expect(component.products().length).toBe(0);
    expect(component.orders().length).toBe(0);
  });

  it('should initialize with zero stats', () => {
    const stats = component.stats();
    expect(stats.totalUsers).toBe(0);
    expect(stats.totalProducts).toBe(0);
    expect(stats.totalOrders).toBe(0);
    expect(stats.totalRevenue).toBe(0);
  });

  describe('toggleDocsSection', () => {
    it('should toggle docs section from open to closed', () => {
      expect(component.docsOpen()).toBeTrue();
      component.toggleDocsSection();
      expect(component.docsOpen()).toBeFalse();
    });

    it('should toggle docs section from closed to open', () => {
      component.docsOpen.set(false);
      component.toggleDocsSection();
      expect(component.docsOpen()).toBeTrue();
    });
  });

  describe('toggleDemoSection', () => {
    it('should toggle demo section from open to closed', () => {
      expect(component.demoOpen()).toBeTrue();
      component.toggleDemoSection();
      expect(component.demoOpen()).toBeFalse();
    });

    it('should toggle demo section from closed to open', () => {
      component.demoOpen.set(false);
      component.toggleDemoSection();
      expect(component.demoOpen()).toBeTrue();
    });
  });

  describe('onNavClick', () => {
    it('should set active view when clicking nav item', () => {
      component.onNavClick('demo_duckdb');
      expect(component.activeView()).toBe('demo_duckdb');
    });

    it('should update current page title when clicking nav item', () => {
      component.onNavClick('demo_sqlite');
      expect(component.currentPageTitle()).toBe('SQLite');
    });

    it('should clear markdown path for demo views', () => {
      component.onNavClick('demo_duckdb');
      expect(component.currentMarkdownPath()).toBe('');
    });

    it('should set markdown path for doc views', () => {
      component.onNavClick('REFACTORING_SUMMARY');
      expect(component.currentMarkdownPath()).toContain('REFACTORING_SUMMARY');
    });
  });

  describe('setActiveView', () => {
    it('should set active view', () => {
      component.setActiveView('DUCKDB_INTEGRATION');
      expect(component.activeView()).toBe('DUCKDB_INTEGRATION');
    });

    it('should set current page title from doc items', () => {
      component.setActiveView('DUCKDB_INTEGRATION');
      expect(component.currentPageTitle()).toBe('DuckDB Integration');
    });

    it('should set current page title from demo items', () => {
      component.setActiveView('demo_websocket');
      expect(component.currentPageTitle()).toBe('WebSocket');
    });

    it('should set current page title to view id if not found', () => {
      component.setActiveView('unknown_view');
      expect(component.currentPageTitle()).toBe('unknown_view');
    });

    it('should clear markdown path for demo_ views', () => {
      component.setActiveView('demo_chart');
      expect(component.currentMarkdownPath()).toBe('');
    });

    it('should set markdown path for views with underscore', () => {
      component.setActiveView('DUCKDB_QUERY_BUILDER');
      expect(component.currentMarkdownPath()).toBe('assets/docs/DUCKDB/QUERY_BUILDER.md');
    });

    it('should set markdown path for views without underscore', () => {
      component.setActiveView('TESTING');
      expect(component.currentMarkdownPath()).toBe('assets/docs/TESTING.md');
    });
  });

  describe('goBackToMenu', () => {
    it('should set showContent to false', () => {
      component.showContent.set(true);
      component.goBackToMenu();
      expect(component.showContent()).toBeFalse();
    });
  });

  describe('onMarkdownLoad', () => {
    it('should log info on markdown load', () => {
      spyOn(loggerService, 'info');
      component.onMarkdownLoad({});
      expect(loggerService.info).toHaveBeenCalledWith('Markdown loaded successfully');
    });
  });

  describe('onMarkdownError', () => {
    it('should log error on markdown error', () => {
      spyOn(loggerService, 'error');
      const error = new Error('Failed to load');
      component.onMarkdownError(error);
      expect(loggerService.error).toHaveBeenCalledWith('Failed to load markdown', error);
    });
  });

  describe('onStatsUpdate', () => {
    it('should update stats when receiving users update', () => {
      component.onStatsUpdate({ type: 'totalUsers', count: 10 });
      expect(component.stats().totalUsers).toBe(10);
    });

    it('should update stats when receiving products update', () => {
      component.onStatsUpdate({ type: 'totalProducts', count: 25 });
      expect(component.stats().totalProducts).toBe(25);
    });

    it('should update stats when receiving orders update', () => {
      component.onStatsUpdate({ type: 'totalOrders', count: 5 });
      expect(component.stats().totalOrders).toBe(5);
    });

    it('should preserve other stats when updating one', () => {
      component.stats.set({
        totalUsers: 10,
        totalProducts: 20,
        totalOrders: 5,
        totalRevenue: 1000,
      });
      component.onStatsUpdate({ type: 'totalUsers', count: 15 });
      const stats = component.stats();
      expect(stats.totalUsers).toBe(15);
      expect(stats.totalProducts).toBe(20);
      expect(stats.totalOrders).toBe(5);
      expect(stats.totalRevenue).toBe(1000);
    });
  });

  describe('loadData', () => {
    beforeEach(() => {
      spyOn(apiService, 'callOrThrow').and.callFake((functionName: string) => {
        switch (functionName) {
          case 'getUsers':
            return Promise.resolve([
              { id: 1, name: 'User 1' },
              { id: 2, name: 'User 2' },
            ]);
          case 'getProducts':
            return Promise.resolve([
              { id: 1, name: 'Product 1', price: 10 },
              { id: 2, name: 'Product 2', price: 20 },
              { id: 3, name: 'Product 3', price: 30 },
            ]);
          case 'getOrders':
            return Promise.resolve([
              { id: 1, total: 100 },
              { id: 2, total: 200 },
            ]);
          default:
            return Promise.resolve([]);
        }
      });
    });

    it('should load users, products, and orders', fakeAsync(async () => {
      await component.loadData();
      tick();

      expect(component.users().length).toBe(2);
      expect(component.products().length).toBe(3);
      expect(component.orders().length).toBe(2);
    }));

    it('should calculate stats from loaded data', fakeAsync(async () => {
      await component.loadData();
      tick();

      const stats = component.stats();
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalProducts).toBe(3);
      expect(stats.totalOrders).toBe(2);
      expect(stats.totalRevenue).toBe(300); // 100 + 200
    }));

    it('should set loading state during data load', fakeAsync(async () => {
      let loadPromise = component.loadData();
      expect(component.isLoading()).toBeTrue();

      await loadPromise;
      tick();

      expect(component.isLoading()).toBeFalse();
    }));

    it('should handle API errors gracefully', fakeAsync(async () => {
      apiService.callOrThrow = jasmine.createSpy().and.rejectWith(new Error('API Error'));

      await component.loadData();
      tick();

      expect(component.isLoading()).toBeFalse();
      expect(loggerService.error).toHaveBeenCalled();
    }));

    it('should handle empty API responses', fakeAsync(async () => {
      apiService.callOrThrow = jasmine.createSpy().and.resolveTo([]);

      await component.loadData();
      tick();

      expect(component.users().length).toBe(0);
      expect(component.products().length).toBe(0);
      expect(component.orders().length).toBe(0);
    }));
  });

  describe('checkMobileView', () => {
    it('should set isMobileView to true for width <= 768', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      component.checkMobileView();
      expect(component.isMobileView()).toBeTrue();
    });

    it('should set isMobileView to false for width > 768', () => {
      Object.defineProperty(window, 'innerWidth', { value: 769, writable: true });
      component.checkMobileView();
      expect(component.isMobileView()).toBeFalse();
    });

    it('should set showContent to false when not mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      component.showContent.set(true);
      component.checkMobileView();
      expect(component.showContent()).toBeFalse();
    });
  });

  describe('Nav Items Configuration', () => {
    it('should have all doc items with required properties', () => {
      const docItems = component.docItems();
      docItems.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(typeof item.active).toBe('boolean');
      });
    });

    it('should have all demo items with required properties', () => {
      const demoItems = component.demoItems();
      demoItems.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
        expect(typeof item.active).toBe('boolean');
      });
    });

    it('should have unique IDs for doc items', () => {
      const docItems = component.docItems();
      const ids = docItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique IDs for demo items', () => {
      const demoItems = component.demoItems();
      const ids = demoItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Signal Initialization', () => {
    it('should initialize isLoading as false', () => {
      expect(component.isLoading()).toBeFalse();
    });

    it('should initialize isMobileView as false', () => {
      expect(component.isMobileView()).toBeFalse();
    });

    it('should initialize showContent as false', () => {
      expect(component.showContent()).toBeFalse();
    });
  });
});
