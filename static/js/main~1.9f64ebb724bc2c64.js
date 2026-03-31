"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["520"],{6231(e,t,a){a.d(t,{Z:()=>n});var i=a(390),o=a(106),r=a(9579),s=a(4494);let n=class{ngOnInit(){console.log("Application Initialized")}};n=((e,t)=>{for(var a,i=t,o=e.length-1;o>=0;o--)(a=e[o])&&(i=a(i)||i);return i})([(0,i.uAl)({selector:"app-root",standalone:!0,imports:[o.MD,r.n3,s.iI],template:`
    <router-outlet />
  `,styles:[`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
  `]})],n)},5140(e,t,a){a.d(t,{S:()=>P});var i=a(9701),o=a(3380),r=a(390),s=a(106),n=a(5008),l=a(9579),d=a(883),c=a(5317),p=a(769),g=a(7594),h=a(7582),u=a(9091),m=a(1841),f=a(6600),v=a(6067),b=a(7608),x=a(28),y=a(2039),w=a(7313),k=a(8787);let C=class{constructor(){this.selectedCategory=(0,i.vPA)("all"),this.charts=(0,i.vPA)([]),this.filteredCharts=(0,i.vPA)([]),this.chartsInitialized=!1}ngOnInit(){this.initializeCharts()}ngAfterViewInit(){this.renderCharts()}initializeCharts(){let e={values:[{category:"A",value:28},{category:"B",value:55},{category:"C",value:43},{category:"D",value:91},{category:"E",value:81},{category:"F",value:53},{category:"G",value:19},{category:"H",value:87}]},t={values:[{date:"2024-01",value:100},{date:"2024-02",value:120},{date:"2024-03",value:85},{date:"2024-04",value:145},{date:"2024-05",value:165},{date:"2024-06",value:130},{date:"2024-07",value:190},{date:"2024-08",value:210}]},a={values:[{date:"2024-01",series:"A",value:100},{date:"2024-01",series:"B",value:80},{date:"2024-02",series:"A",value:120},{date:"2024-02",series:"B",value:95},{date:"2024-03",series:"A",value:85},{date:"2024-03",series:"B",value:110},{date:"2024-04",series:"A",value:145},{date:"2024-04",series:"B",value:125}]},i=[{id:"bar-chart",title:"Bar Chart",icon:"\uD83D\uDCCA",description:"Simple vertical bar chart for categorical data",category:"basic",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:e,mark:{type:"bar",cornerRadius:4},encoding:{x:{field:"category",type:"ordinal",axis:{labelAngle:0}},y:{field:"value",type:"quantitative",axis:{grid:!0}},color:{field:"value",type:"quantitative",scale:{scheme:"blues"}},tooltip:[{field:"category"},{field:"value"}]}}},{id:"line-chart",title:"Line Chart",icon:"\uD83D\uDCC8",description:"Time series line chart with smooth curves",category:"basic",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:t,mark:{type:"line",strokeWidth:3,point:!0},encoding:{x:{field:"date",type:"temporal",axis:{format:"%Y-%m"}},y:{field:"value",type:"quantitative",axis:{grid:!0}},color:{value:"#3b82f6"},tooltip:[{field:"date"},{field:"value"}]}}},{id:"scatter-plot",title:"Scatter Plot",icon:"⚬",description:"Scatter plot for correlation analysis",category:"basic",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{values:[{x:1,y:5},{x:2,y:8},{x:3,y:12},{x:4,y:15},{x:5,y:18},{x:6,y:22},{x:7,y:25},{x:8,y:28},{x:9,y:32}]},mark:{type:"point",filled:!0,size:100},encoding:{x:{field:"x",type:"quantitative",axis:{grid:!0}},y:{field:"y",type:"quantitative",axis:{grid:!0}},color:{field:"y",type:"quantitative",scale:{scheme:"viridis"}},tooltip:[{field:"x"},{field:"y"}]}}},{id:"pie-chart",title:"Pie Chart",icon:"\uD83E\uDD67",description:"Pie chart for proportion visualization",category:"basic",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:e,mark:{type:"arc",innerRadius:50,stroke:"#1e293b",strokeWidth:2},encoding:{theta:{field:"value",type:"quantitative",scale:{domain:[0,100]}},color:{field:"category",type:"nominal",scale:{scheme:"category10"}},tooltip:[{field:"category"},{field:"value"}]}}},{id:"area-chart",title:"Area Chart",icon:"\uD83D\uDCCA",description:"Stacked area chart for cumulative trends",category:"advanced",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:a,mark:{type:"area",line:!0},encoding:{x:{field:"date",type:"temporal",axis:{format:"%Y-%m"}},y:{field:"value",type:"quantitative",stack:"zero"},color:{field:"series",type:"nominal",scale:{scheme:"set2"}},tooltip:[{field:"date"},{field:"series"},{field:"value"}]}}},{id:"heatmap",title:"Heat Map",icon:"\uD83D\uDD25",description:"Heat map for matrix data visualization",category:"advanced",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{values:[{x:"A",y:1,value:10},{x:"A",y:2,value:20},{x:"A",y:3,value:30},{x:"B",y:1,value:15},{x:"B",y:2,value:25},{x:"B",y:3,value:35},{x:"C",y:1,value:20},{x:"C",y:2,value:30},{x:"C",y:3,value:40},{x:"D",y:1,value:25},{x:"D",y:2,value:35},{x:"D",y:3,value:45}]},mark:"rect",encoding:{x:{field:"x",type:"ordinal"},y:{field:"y",type:"ordinal"},color:{field:"value",type:"quantitative",scale:{scheme:"oranges"}},tooltip:[{field:"x"},{field:"y"},{field:"value"}]}}},{id:"histogram",title:"Histogram",icon:"\uD83D\uDCCA",description:"Histogram for distribution analysis",category:"advanced",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{values:Array.from({length:100},()=>({value:Math.floor(100*Math.random())}))},mark:{type:"bar",cornerRadius:2},encoding:{x:{field:"value",type:"quantitative",bin:{maxbins:20},axis:{grid:!0}},y:{field:"*",type:"quantitative",aggregate:"count",axis:{grid:!0}},color:{value:"#8b5cf6"},tooltip:[{field:"value",bin:!0},{field:"*",aggregate:"count"}]}}},{id:"box-plot",title:"Box Plot",icon:"\uD83D\uDCE6",description:"Box plot for statistical distribution",category:"advanced",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{values:Array.from({length:200},()=>({category:["A","B","C"][Math.floor(3*Math.random())],value:100*Math.random()}))},mark:"boxplot",encoding:{x:{field:"category",type:"ordinal"},y:{field:"value",type:"quantitative"},color:{field:"category",type:"nominal"},tooltip:[{field:"category"},{field:"value"}]}}},{id:"interactive-bar",title:"Interactive Bar",icon:"\uD83D\uDDB1️",description:"Bar chart with hover and selection",category:"interactive",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:e,mark:{type:"bar",cornerRadius:4},params:[{name:"highlight",select:{type:"point",fields:["category"],on:"mouseover"}}],encoding:{x:{field:"category",type:"ordinal",axis:{labelAngle:0}},y:{field:"value",type:"quantitative"},color:{condition:{param:"highlight",field:"value",type:"quantitative"},value:"#cbd5e1"},tooltip:[{field:"category"},{field:"value"}]}}},{id:"brush-select",title:"Brush Selection",icon:"\uD83D\uDD8C️",description:"Scatter plot with brush selection",category:"interactive",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:{values:Array.from({length:100},()=>({x:100*Math.random(),y:100*Math.random()}))},mark:{type:"point",filled:!0},params:[{name:"brush",select:{type:"interval",encodings:["x","y"]}}],encoding:{x:{field:"x",type:"quantitative"},y:{field:"y",type:"quantitative"},color:{condition:{param:"brush",value:"#3b82f6"},value:"#cbd5e1"},tooltip:[{field:"x"},{field:"y"}]}}},{id:"zoom-pan",title:"Zoom & Pan",icon:"\uD83D\uDD0D",description:"Line chart with zoom and pan",category:"interactive",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:t,mark:{type:"line",strokeWidth:3},params:[{name:"grid",select:"interval",bind:"scales"}],encoding:{x:{field:"date",type:"temporal",axis:{format:"%Y-%m"}},y:{field:"value",type:"quantitative"},color:{value:"#10b981"},tooltip:[{field:"date"},{field:"value"}]}}},{id:"tooltip-chart",title:"Rich Tooltips",icon:"\uD83D\uDCAC",description:"Chart with enhanced tooltips",category:"interactive",spec:{$schema:"https://vega.github.io/schema/vega-lite/v5.json",data:a,mark:{type:"line",point:!0},encoding:{x:{field:"date",type:"temporal"},y:{field:"value",type:"quantitative"},color:{field:"series",type:"nominal"},tooltip:[{field:"date",type:"temporal",format:"%Y-%m"},{field:"series",type:"nominal"},{field:"value",type:"quantitative",format:".2f"}]}}}];this.charts.set(i),this.filterCharts()}filterCharts(){let e=this.selectedCategory(),t=this.charts();"all"===e?this.filteredCharts.set(t):this.filteredCharts.set(t.filter(t=>t.category===e))}async renderCharts(){if(!this.chartsInitialized)for(let e of(this.chartsInitialized=!0,await new Promise(e=>setTimeout(e,100)),this.filteredCharts())){let t=document.getElementById(`viz-${e.id}`);if(t)try{await (0,k.Ay)(t,e.spec,{actions:{export:!0,source:!1,compiled:!1},renderer:"svg"})}catch(t){console.error(`Failed to render chart ${e.id}:`,t)}}}};C=((e,t)=>{for(var a,i=t,o=e.length-1;o>=0;o--)(a=e[o])&&(i=a(i)||i);return i})([(0,r.uAl)({selector:"app-vega-charts-demo",standalone:!0,imports:[s.MD],template:`
    <div class="charts-demo-container">
      <!-- Header -->
      <header class="charts-header">
        <div class="header-content">
          <div class="header-icon">\u{1F4CA}</div>
          <div class="header-info">
            <h1>Vega Charts Integration</h1>
            <p>Professional data visualization with Vega-Lite</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <span class="stat-value">{{ charts().length }}</span>
            <span class="stat-label">Chart Types</span>
          </div>
        </div>
      </header>

      <!-- Feature Highlights -->
      <div class="feature-bar">
        <div class="feature-item">
          <span class="feature-icon">\u{1F3A8}</span>
          <span class="feature-text">Declarative</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u{1F4C8}</span>
          <span class="feature-text">Interactive</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u{1F527}</span>
          <span class="feature-text">Customizable</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">\u{1F4F1}</span>
          <span class="feature-text">Responsive</span>
        </div>
      </div>

      <!-- Category Filter -->
      <div class="category-filter">
        <button
          class="filter-btn"
          [class.active]="selectedCategory() === 'all'"
          (click)="selectedCategory.set('all')">
          All Charts
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedCategory() === 'basic'"
          (click)="selectedCategory.set('basic')">
          \u{1F4CA} Basic
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedCategory() === 'advanced'"
          (click)="selectedCategory.set('advanced')">
          \u{1F4C8} Advanced
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedCategory() === 'interactive'"
          (click)="selectedCategory.set('interactive')">
          \u{1F5B1}\uFE0F Interactive
        </button>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid">
        @for (chart of filteredCharts(); track chart.id) {
          <div class="chart-card" [id]="'chart-' + chart.id">
            <div class="chart-header">
              <div class="chart-title">
                <span class="chart-icon">{{ chart.icon }}</span>
                <h3>{{ chart.title }}</h3>
              </div>
              <span class="chart-category">{{ chart.category }}</span>
            </div>
            <p class="chart-description">{{ chart.description }}</p>
            <div class="chart-container" [id]="'viz-' + chart.id"></div>
          </div>
        }
      </div>
    </div>
  `,styles:[`
    .charts-demo-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
      color: #e2e8f0;
    }

    .charts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 16px;
      margin-bottom: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      font-size: 48px;
    }

    .header-info h1 {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 4px;
    }

    .header-info p {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }

    .header-stats {
      display: flex;
      gap: 16px;
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 20px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .feature-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      font-size: 13px;
      color: #94a3b8;
    }

    .category-filter {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 10px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-color: transparent;
      color: #fff;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
      gap: 24px;
    }

    .chart-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 20px;
      transition: all 0.3s;
    }

    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      border-color: rgba(59, 130, 246, 0.3);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .chart-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chart-icon {
      font-size: 24px;
    }

    .chart-title h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .chart-category {
      padding: 4px 12px;
      background: rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      color: #3b82f6;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .chart-description {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 16px;
    }

    .chart-container {
      width: 100%;
      height: 300px;
      background: rgba(15, 23, 42, 0.6);
      border-radius: 12px;
      overflow: hidden;
    }

    .chart-container :deep(vega-embed) {
      width: 100%;
      height: 100%;
    }

    .chart-container :deep(vega-embed summary) {
      display: none;
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]})],C);var A=Object.defineProperty,z=Object.getOwnPropertyDescriptor,_=(e,t,a,i)=>{for(var o,r=i>1?void 0:i?z(t,a):t,s=e.length-1;s>=0;s--)(o=e[s])&&(r=(i?o(t,a,r):o(r))||r);return i&&r&&A(t,a,r),r};let P=class{constructor(){this.logger=(0,i.WQX)(c.g),this.http=(0,i.WQX)(n.Qq),this.api=(0,i.WQX)(p.G),this.router=(0,i.WQX)(l.Ix),this.activeView=(0,i.vPA)("README"),this.isLoading=(0,i.vPA)(!1),this.isMobileView=(0,i.vPA)(!1),this.showContent=(0,i.vPA)(!1),this.users=(0,i.vPA)([]),this.products=(0,i.vPA)([]),this.orders=(0,i.vPA)([]),this.docsOpen=(0,i.vPA)(!0),this.demoOpen=(0,i.vPA)(!0),this.docItems=(0,i.vPA)([{id:"docs_home",label:"\uD83D\uDCDA All Docs",icon:"\uD83D\uDCDA",active:!0},{id:"DUCKDB_CRUD_INTEGRATION",label:"DuckDB CRUD Guide",icon:"\uD83E\uDD86",active:!1},{id:"SQLITE_CRUD_INTEGRATION",label:"SQLite CRUD Guide",icon:"\uD83D\uDDC4️",active:!1}]),this.demoItems=(0,i.vPA)([{id:"demo_sqlite_crud",label:"\uD83D\uDDC4️ SQLite CRUD",icon:"\uD83D\uDDC4️",active:!1},{id:"demo_sqlite_exploration",label:"\uD83D\uDDC4️ SQLite Exploration",icon:"\uD83D\uDD0D",active:!1},{id:"demo_duckdb_crud",label:"\uD83E\uDD86 DuckDB CRUD",icon:"\uD83E\uDD86",active:!1},{id:"demo_duckdb_exploration",label:"\uD83E\uDD86 DuckDB Exploration",icon:"\uD83D\uDD2C",active:!1},{id:"demo_db_comparison",label:"⚖️ DB Comparison",icon:"⚖️",active:!1},{id:"demo_data_migration",label:"\uD83D\uDD04 Data Migration",icon:"\uD83D\uDD04",active:!1},{id:"demo_realtime_sync",label:"\uD83D\uDD0C Real-Time Sync",icon:"\uD83D\uDD0C",active:!1},{id:"demo_vega_charts",label:"\uD83D\uDCCA Vega Charts",icon:"\uD83D\uDCCA",active:!1}]),this.currentPageTitle=(0,i.vPA)("Overview"),this.currentMarkdownPath=(0,i.vPA)("assets/docs/README.md"),this.stats=(0,i.vPA)({totalUsers:0,totalProducts:0,totalOrders:0,totalRevenue:0})}ngOnInit(){this.loadData(),this.checkMobileView(),window.addEventListener("resize",()=>this.checkMobileView())}checkMobileView(){this.isMobileView.set(window.innerWidth<=768),this.isMobileView()||this.showContent.set(!1)}goBackToMenu(){this.showContent.set(!1)}async loadData(){this.isLoading.set(!0);try{let[e,t,a]=await Promise.all([this.api.callOrThrow("getUsers").catch(()=>[]),this.api.callOrThrow("getProducts").catch(()=>[]),this.api.callOrThrow("getOrders").catch(()=>[])]);this.users.set(e),this.products.set(t),this.orders.set(a),this.stats.set({totalUsers:e.length,totalProducts:t.length,totalOrders:a.length,totalRevenue:a.reduce((e,t)=>e+(t.total||0),0)})}catch(e){this.logger.error("Failed to load data",e)}finally{this.isLoading.set(!1)}}setActiveView(e){this.activeView.set(e);let t=this.docItems().find(t=>t.id===e),a=this.demoItems().find(t=>t.id===e),i=t||a;if(this.currentPageTitle.set(i?i.label:e),e.startsWith("demo_"))this.currentMarkdownPath.set("");else{let t=e.includes("_")&&!e.startsWith("demo_")?`assets/docs/${e.replace("_","/")}.md`:`assets/docs/${e}.md`;this.currentMarkdownPath.set(t)}this.isMobileView()&&this.showContent.set(!0),this.contentArea&&(this.contentArea.nativeElement.scrollTop=0)}onNavClick(e){"docs_home"===e?this.router.navigate(["/docs"]):this.setActiveView(e)}toggleDocsSection(){this.docsOpen.update(e=>!e)}toggleDemoSection(){this.demoOpen.update(e=>!e)}onMarkdownLoad(e){this.logger.info("Markdown loaded successfully")}onMarkdownError(e){this.logger.error("Failed to load markdown",e)}onStatsUpdate(e){this.stats.update(t=>({...t,[e.type]:e.count})),this.loadData()}};_([(0,o.ViewChild)("contentArea")],P.prototype,"contentArea",2),P=_([(0,r.uAl)({selector:"app-dashboard",standalone:!0,imports:[s.MD,d.y2,g.v,h.b,u.Y,m.P,f.Q,v.u,b.n,x.Q,y.d,w.p,C],template:`
    <div class="dashboard-container">
      <!-- First Panel: Dot Pills Switcher -->
      <aside class="panel-first" [class.hidden]="isMobileView() && showContent()">
        <!-- Docs Section -->
        <div class="pill-section">
          <button class="section-header" (click)="toggleDocsSection()">
            <span class="section-title">Documentation</span>
            <span class="section-toggle">{{ docsOpen() ? '\u25BC' : '\u25B6' }}</span>
          </button>
          @if (docsOpen()) {
            <div class="pill-container">
              @for (item of docItems(); track item.id) {
                <button
                  class="dot-pill"
                  [class.active]="activeView() === item.id"
                  (click)="onNavClick(item.id)"
                >
                  <span class="pill-dot"></span>
                  <span class="pill-text">{{ item.label }}</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Thirdparty Demo Section -->
        <div class="pill-section">
          <button class="section-header" (click)="toggleDemoSection()">
            <span class="section-title">Thirdparty Demos</span>
            <span class="section-toggle">{{ demoOpen() ? '\u25BC' : '\u25B6' }}</span>
          </button>
          @if (demoOpen()) {
            <div class="pill-container">
              @for (item of demoItems(); track item.id) {
                <button
                  class="dot-pill"
                  [class.active]="activeView() === item.id"
                  (click)="onNavClick(item.id)"
                >
                  <span class="pill-dot"></span>
                  <span class="pill-text">{{ item.label }}</span>
                </button>
              }
            </div>
          }
        </div>
      </aside>

      <!-- Second Panel: Content -->
      <main class="panel-second" [class.visible]="isMobileView() && showContent()">
        <!-- Mobile Close Button -->
        <button class="mobile-close-btn" (click)="goBackToMenu()">
          <span class="close-icon">\u2190</span>
          <span class="close-text">Menu</span>
        </button>

        <!-- Content Area -->
        <div class="content-area" #contentArea>
          @if (activeView() === 'demo_sqlite_crud') {
            <app-demo-sqlite-crud />
          } @else if (activeView() === 'demo_duckdb_crud') {
            <app-demo-duckdb-crud />
          } @else if (activeView() === 'demo_sqlite_exploration') {
            <app-sqlite-exploration />
          } @else if (activeView() === 'demo_duckdb_exploration') {
            <app-duckdb-exploration />
          } @else if (activeView() === 'demo_db_comparison') {
            <app-db-comparison-demo />
          } @else if (activeView() === 'demo_data_migration') {
            <app-data-migration-demo />
          } @else if (activeView() === 'demo_realtime_sync') {
            <app-realtime-sync-demo />
          } @else if (activeView() === 'demo_vega_charts') {
            <app-vega-charts-demo />
          } @else if (activeView() === 'demo_duckdb') {
            <app-duckdb-users [items]="users()" (statsChange)="onStatsUpdate($any($event))"></app-duckdb-users>
          } @else if (activeView() === 'demo_sqlite') {
            <app-duckdb-products [items]="products()" (statsChange)="onStatsUpdate($any($event))"></app-duckdb-products>
          } @else if (activeView() === 'demo_websocket') {
            <app-duckdb-orders [items]="orders()" (statsChange)="onStatsUpdate($any($event))"></app-duckdb-orders>
          } @else {
            <markdown
              [src]="currentMarkdownPath()"
              (load)="onMarkdownLoad($event)"
              (error)="onMarkdownError($event)">
            </markdown>
          }
        </div>
      </main>


    </div>
  `,styles:[`
    .dashboard-container {
      display: flex;
      height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      overflow: hidden;
    }

    /* First Panel: Dot Pills */
    .panel-first {
      width: 320px;
      background: rgba(15, 23, 42, 0.95);
      border-right: 1px solid rgba(148, 163, 184, 0.1);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      backdrop-filter: blur(10px);
    }

    .pill-section {
      margin-bottom: 16px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 12px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 10px;
    }

    .section-header:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-toggle {
      font-size: 10px;
      opacity: 0.7;
    }

    .pill-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-content: flex-start;
    }

    .dot-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: transparent;
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 20px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 13px;
    }

    .dot-pill:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .dot-pill.active {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-color: transparent;
      color: #fff;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
    }

    .pill-dot {
      width: 8px;
      height: 8px;
      min-width: 8px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.6;
      transition: all 0.3s;
    }

    .dot-pill.active .pill-dot {
      opacity: 1;
      background: #fff;
    }

    .pill-text {
      font-size: 14px;
      font-weight: 500;
    }

    /* Second Panel: Content */
    .panel-second {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #0f172a;
    }

    .drawer-handle {
      display: none;
      width: 100%;
      padding: 12px 20px;
      background: rgba(30, 41, 59, 0.8);
      border: none;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .handle-bar {
      width: 40px;
      height: 4px;
      background: rgba(148, 163, 184, 0.4);
      border-radius: 2px;
    }

    .current-view-label {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding: 24px 32px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      transition: all 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    }

    .stat-icon {
      font-size: 40px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
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
      color: #64748b;
      margin-top: 4px;
    }

    .stat-primary .stat-icon { background: rgba(59, 130, 246, 0.2); }
    .stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); }
    .stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); }
    .stat-info .stat-icon { background: rgba(6, 182, 212, 0.2); }

    /* Content Area */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 0 32px 32px;
    }

    /* Markdown Styles */
    .content-area ::ng-deep markdown {
      color: #e2e8f0;
      line-height: 1.7;
    }

    .content-area ::ng-deep markdown h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .content-area ::ng-deep markdown h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 2rem 0 1rem;
    }

    .content-area ::ng-deep markdown h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #e2e8f0;
      margin: 1.5rem 0 0.75rem;
    }

    .content-area ::ng-deep markdown p {
      margin: 0 0 1rem;
    }

    .content-area ::ng-deep markdown ul, .content-area ::ng-deep markdown ol {
      margin: 0 0 1rem;
      padding-left: 1.5rem;
    }

    .content-area ::ng-deep markdown li {
      margin-bottom: 0.5rem;
    }

    .content-area ::ng-deep markdown code {
      background: rgba(30, 41, 59, 0.8);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
      color: #06b6d4;
    }

    .content-area ::ng-deep markdown pre {
      background: #1e293b;
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 0 0 1rem;
    }

    .content-area ::ng-deep markdown pre code {
      background: transparent;
      padding: 0;
      color: #e2e8f0;
    }

    .content-area ::ng-deep markdown blockquote {
      border-left: 4px solid #06b6d4;
      padding-left: 1rem;
      margin: 0 0 1rem;
      color: #94a3b8;
      font-style: italic;
    }

    .content-area ::ng-deep markdown table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 1rem;
    }

    .content-area ::ng-deep markdown th, .content-area ::ng-deep markdown td {
      padding: 0.75rem;
      border: 1px solid rgba(148, 163, 184, 0.2);
      text-align: left;
    }

    .content-area ::ng-deep markdown th {
      background: rgba(30, 41, 59, 0.5);
      font-weight: 600;
    }

    .content-area ::ng-deep markdown a {
      color: #06b6d4;
      text-decoration: none;
    }

    .content-area ::ng-deep markdown a:hover {
      text-decoration: underline;
    }

    .content-area ::ng-deep markdown hr {
      border: none;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      margin: 2rem 0;
    }

    /* Mobile Close Button */
    .mobile-close-btn {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin: 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .mobile-close-btn:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
      color: #fff;
    }

    .close-icon {
      font-size: 18px;
    }
    .drawer-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        flex-direction: column;
      }

      .panel-first {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        z-index: 100;
        transform: translateX(0);
        transition: transform 0.3s ease;
        padding: 20px 16px;
        overflow-y: auto;
      }

      .panel-first.hidden {
        transform: translateX(-100%);
        pointer-events: none;
      }

      .pill-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .pill-section {
        margin-bottom: 20px;
      }

      .section-header {
        padding: 12px 16px;
        font-size: 13px;
      }

      .dot-pill {
        padding: 12px 14px;
        font-size: 13px;
        justify-content: center;
      }

      .panel-second {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        height: 100vh;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 50;
      }

      .panel-second.visible {
        transform: translateX(0);
      }

      .mobile-close-btn {
        display: flex;
        margin: 12px;
        padding: 12px 16px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 12px;
      }

      .stat-card {
        padding: 14px;
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        font-size: 28px;
      }

      .stat-value {
        font-size: 22px;
      }

      .content-area {
        padding: 0 12px 12px;
      }
    }

    @media (max-width: 480px) {
      .pill-container {
        grid-template-columns: 1fr;
      }

      .card-title {
        font-size: 1.2rem;
      }

      .title-icon {
        font-size: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]})],P)}}]);
//# sourceMappingURL=main~1.9f64ebb724bc2c64.js.map