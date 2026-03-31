"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["10"],{7445(e,t,o){o.d(t,{A:()=>l});var a=o(390),r=o(106),i=o(4494),n=o(883),s=o(9033);let l=class{constructor(){this.docGroups=[],this.filteredGroups=[]}ngOnInit(){this.docGroups=JSON.parse(JSON.stringify(s.ed)),this.filteredGroups=[...this.docGroups].sort((e,t)=>e.order-t.order),this.filteredGroups.forEach(e=>{e.sections.sort((e,t)=>e.order-t.order)})}filterDocs(e){let t=e.toLowerCase();if(!t){this.filteredGroups=[...this.docGroups].sort((e,t)=>e.order-t.order),this.filteredGroups.forEach(e=>{e.sections.sort((e,t)=>e.order-t.order)});return}this.filteredGroups=this.docGroups.map(e=>({...e,sections:e.sections.filter(e=>e.title.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)||e.tags?.some(e=>e.toLowerCase().includes(t)))})).filter(e=>e.title.toLowerCase().includes(t)||e.description.toLowerCase().includes(t)||e.sections.length>0).sort((e,t)=>e.order-t.order)}};l=((e,t)=>{for(var o,a=t,r=e.length-1;r>=0;r--)(o=e[r])&&(a=o(a)||a);return a})([(0,a.uAl)({selector:"app-docs-home",standalone:!0,imports:[r.MD,i.iI,n.y2],template:`
    <div class="docs-home">
      <header class="docs-header">
        <h1>\u{1F4DA} Production-Ready CRUD Integration Docs</h1>
        <p class="subtitle">Complete guides for DuckDB and SQLite integration with Zig + Angular</p>
      </header>

      <div class="search-box">
        <input
          type="text"
          placeholder="Search documentation..."
          class="search-input"
          #searchInput
          (input)="filterDocs(searchInput.value)"
        />
      </div>

      <div class="doc-groups">
        <div class="doc-group" *ngFor="let group of filteredGroups">
          <div class="group-header">
            <span class="group-icon">{{ group.icon }}</span>
            <div>
              <h2>{{ group.title }}</h2>
              <p>{{ group.description }}</p>
            </div>
          </div>

          <div class="section-grid">
            <a
              [routerLink]="['/docs', group.id, section.id]"
              class="section-card"
              *ngFor="let section of group.sections"
            >
              <div class="section-icon">{{ section.icon }}</div>
              <div class="section-content">
                <h3>{{ section.title }}</h3>
                <p>{{ section.description }}</p>
              </div>
              <div class="section-arrow">\u2192</div>
            </a>
          </div>
        </div>
      </div>

      <!-- Auto-discovered docs notice -->
      <footer class="docs-footer">
        <p>
          \u{1F4DD} Documentation is auto-discovered from markdown files in 
          <code>src/assets/docs/</code>
        </p>
        <p class="footer-hint">
          To add new documentation: create a .md file and add an entry to docs-manifest.ts
        </p>
      </footer>
    </div>
  `,styles:[`
    .docs-home {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .docs-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .docs-header h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #6b7280;
    }

    .search-box {
      max-width: 600px;
      margin: 0 auto 3rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      transition: all 0.3s;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    .doc-groups {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    .doc-group {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f3f4f6;
    }

    .group-icon {
      font-size: 2.5rem;
    }

    .group-header h2 {
      font-size: 1.8rem;
      margin-bottom: 0.25rem;
      color: #1f2937;
    }

    .group-header p {
      color: #6b7280;
      font-size: 1rem;
    }

    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .section-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #f9fafb;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s;
      border: 2px solid transparent;

      &:hover {
        background: white;
        border-color: #667eea;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .section-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }

      .section-content {
        flex: 1;

        h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
          color: #1f2937;
        }

        p {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0;
        }
      }

      .section-arrow {
        font-size: 1.5rem;
        color: #9ca3af;
        transition: transform 0.3s;
      }

      &:hover .section-arrow {
        transform: translateX(5px);
        color: #667eea;
      }
    }

    .docs-footer {
      margin-top: 4rem;
      padding: 2rem;
      background: rgba(102, 126, 234, 0.05);
      border-radius: 12px;
      text-align: center;

      p {
        margin: 0.5rem 0;
        color: #6b7280;
        font-size: 0.9rem;

        code {
          background: rgba(102, 126, 234, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.85em;
          color: #667eea;
        }
      }

      .footer-hint {
        font-size: 0.85rem;
        font-style: italic;
      }
    }
  `]})],l)},2776(e,t,o){o.d(t,{N:()=>s});var a=o(390),r=o(106),i=o(4494),n=o(883);let s=class{constructor(e,t){this.route=e,this.http=t,this.docContent=null,this.currentSectionId=""}ngOnInit(){this.route.params.subscribe(e=>{let t=e.sectionId;this.currentSectionId=t,this.loadDocContent(t)})}loadDocContent(e){let t=`assets/docs/${e}.md`;this.http.get(t,{responseType:"text"}).subscribe({next:t=>{this.docContent={title:this.extractTitle(t,e),icon:this.extractIcon(e),lastUpdated:"2026-03-31",readTime:"10 min",content:t,relatedDocs:this.getRelatedDocs(e)}},error:t=>{console.error("Failed to load documentation:",t),this.docContent={title:"Documentation Not Found",icon:"❌",lastUpdated:"2026-03-31",readTime:"1 min",content:`# Documentation Not Found\\n\\nThe requested documentation "${e}" could not be loaded.\\n\\n## Available Documentation\\n\\n- [DuckDB CRUD Integration](/docs/duckdb-crud/DUCKDB_CRUD_INTEGRATION)\\n- [SQLite CRUD Integration](/docs/sqlite-crud/SQLITE_CRUD_INTEGRATION)`,relatedDocs:["/docs/duckdb-crud/DUCKDB_CRUD_INTEGRATION","/docs/sqlite-crud/SQLITE_CRUD_INTEGRATION"]}}})}extractTitle(e,t){let o=e.match(/^# (.+)$/m);return o?o[1]:t.replace(/-/g," ").replace(/\\b\\w/g,e=>e.toUpperCase())}extractIcon(e){return({DUCKDB_CRUD_INTEGRATION:"\uD83E\uDD86",SQLITE_CRUD_INTEGRATION:"\uD83D\uDDC4️","duckdb-vs-sqlite":"⚖️","performance-comparison":"\uD83D\uDCCA","use-cases":"\uD83C\uDFAF","security-checklist":"\uD83D\uDD12","error-handling":"⚠️","testing-guide":"\uD83E\uDDEA",troubleshooting:"\uD83D\uDD0D"})[e]||"\uD83D\uDCC4"}getRelatedDocs(e){return e.includes("DUCKDB")?["/docs/sqlite-crud/SQLITE_CRUD_INTEGRATION","/docs/comparison/duckdb-vs-sqlite"]:e.includes("SQLITE")?["/docs/duckdb-crud/DUCKDB_CRUD_INTEGRATION","/docs/comparison/duckdb-vs-sqlite"]:e.includes("comparison")||e.includes("production")?["/docs/duckdb-crud/DUCKDB_CRUD_INTEGRATION","/docs/sqlite-crud/SQLITE_CRUD_INTEGRATION"]:[]}scrollToTop(){window.scrollTo({top:0,behavior:"smooth"})}};s=((e,t)=>{for(var o,a=t,r=e.length-1;r>=0;r--)(o=e[r])&&(a=o(a)||a);return a})([(0,a.uAl)({selector:"app-docs-viewer",standalone:!0,imports:[r.MD,i.iI,n.y2],template:`
    <div class="docs-viewer" *ngIf="docContent; else loading">
      <nav class="breadcrumb">
        <a routerLink="/docs" class="breadcrumb-link">\u{1F4DA} Docs</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ docContent.title }}</span>
      </nav>

      <article class="doc-article">
        <header class="doc-header">
          <div class="doc-icon">{{ docContent.icon }}</div>
          <h1>{{ docContent.title }}</h1>

          <div class="doc-meta">
            <span class="meta-item" *ngIf="docContent.lastUpdated">
              \u{1F4C5} Last updated: {{ docContent.lastUpdated }}
            </span>
            <span class="meta-item" *ngIf="docContent.readTime">
              \u23F1\uFE0F {{ docContent.readTime }} read
            </span>
          </div>
        </header>

        <div class="doc-content">
          <markdown [data]="docContent.content"></markdown>
        </div>

        <footer class="doc-footer" *ngIf="docContent.relatedDocs?.length">
          <h3>Related Documentation</h3>
          <div class="related-grid">
            <a
              [routerLink]="link"
              class="related-card"
              *ngFor="let link of docContent.relatedDocs"
            >
              \u{1F4C4} {{ link }}
            </a>
          </div>
        </footer>
      </article>

      <div class="docs-nav">
        <button class="nav-btn" (click)="scrollToTop()">
          \u2191 Back to Top
        </button>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading documentation...</p>
      </div>
    </ng-template>
  `,styles:[`
    .docs-viewer {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .breadcrumb-link {
      color: #667eea;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .breadcrumb-separator {
      color: #9ca3af;
    }

    .doc-article {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .doc-header {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #f3f4f6;
    }

    .doc-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .doc-header h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #1f2937;
    }

    .doc-meta {
      display: flex;
      gap: 2rem;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .doc-content {
      line-height: 1.8;
      color: #374151;

      :deep(h1) {
        font-size: 2rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: #1f2937;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 0.5rem;
      }

      :deep(h2) {
        font-size: 1.5rem;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: #1f2937;
      }

      :deep(h3) {
        font-size: 1.25rem;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #1f2937;
      }

      :deep(p) {
        margin-bottom: 1rem;
      }

      :deep(code) {
        background: #f3f4f6;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9em;
        color: #dc2626;
      }

      :deep(pre) {
        background: #1f2937;
        color: #f9fafb;
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1.5rem 0;

        code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
      }

      :deep(blockquote) {
        border-left: 4px solid #667eea;
        padding-left: 1rem;
        margin: 1.5rem 0;
        color: #6b7280;
        font-style: italic;
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;

        th, td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }

        th {
          background: #f9fafb;
          font-weight: 600;
        }

        tr:nth-child(even) {
          background: #f9fafb;
        }
      }

      :deep(ul), :deep(ol) {
        margin-bottom: 1rem;
        padding-left: 2rem;
      }

      :deep(li) {
        margin-bottom: 0.5rem;
      }

      :deep(a) {
        color: #667eea;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .doc-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid #f3f4f6;

      h3 {
        margin-bottom: 1rem;
        color: #1f2937;
      }
    }

    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .related-card {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      text-decoration: none;
      color: #374151;
      transition: all 0.3s;

      &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
    }

    .docs-nav {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
    }

    .nav-btn {
      padding: 1rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;

      &:hover {
        background: #5568d3;
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;

      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid #f3f4f6;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      p {
        color: #6b7280;
        font-size: 1.1rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]})],s)},9091(e,t,o){o.d(t,{Y:()=>c});var a=o(9701),r=o(390),i=o(106),n=o(5807),s=Object.defineProperty,l=Object.getOwnPropertyDescriptor,d=(e,t,o,a)=>{for(var r,i=a>1?void 0:a?l(t,o):t,n=e.length-1;n>=0;n--)(r=e[n])&&(i=(a?r(t,o,i):r(i))||i);return a&&i&&s(t,o,i),i};let c=class{constructor(){this.items=[],this.statsChange=new a.bkB,this.orderConfig={entityName:"Order",entityNamePlural:"Orders",icon:"\uD83D\uDED2",columns:[{key:"id",label:"ID",width:"60px"},{key:"customer_name",label:"Customer"},{key:"product_name",label:"Product"},{key:"quantity",label:"Quantity"},{key:"total",label:"Total"},{key:"status",label:"Status",type:"status"},{key:"created_at",label:"Created",type:"date"},{key:"actions",label:"Actions",type:"actions"}],formFields:[{key:"customer_name",label:"Customer Name",type:"text"},{key:"customer_email",label:"Customer Email",type:"text"},{key:"product_name",label:"Product Name",type:"text"},{key:"quantity",label:"Quantity",type:"number"},{key:"total",label:"Total",type:"number"},{key:"status",label:"Status",type:"select",options:[{value:"pending",label:"Pending"},{value:"processing",label:"Processing"},{value:"shipped",label:"Shipped"},{value:"delivered",label:"Delivered"},{value:"cancelled",label:"Cancelled"}]}]}}onStatsUpdate(e){this.statsChange.emit(e)}};d([(0,r.pde)()],c.prototype,"items",2),d([(0,r.k7i)()],c.prototype,"statsChange",2),c=d([(0,r.uAl)({selector:"app-duckdb-orders",standalone:!0,imports:[i.MD,n.u],template:`
    <app-data-table
      [config]="orderConfig"
      [items]="items"
      (statsChange)="onStatsUpdate($event)"
    ></app-data-table>
  `})],c)},7582(e,t,o){o.d(t,{b:()=>c});var a=o(9701),r=o(390),i=o(106),n=o(5807),s=Object.defineProperty,l=Object.getOwnPropertyDescriptor,d=(e,t,o,a)=>{for(var r,i=a>1?void 0:a?l(t,o):t,n=e.length-1;n>=0;n--)(r=e[n])&&(i=(a?r(t,o,i):r(i))||i);return a&&i&&s(t,o,i),i};let c=class{constructor(){this.items=[],this.statsChange=new a.bkB,this.productConfig={entityName:"Product",entityNamePlural:"Products",icon:"\uD83D\uDCE6",columns:[{key:"id",label:"ID",width:"60px"},{key:"name",label:"Name"},{key:"description",label:"Description"},{key:"price",label:"Price"},{key:"stock",label:"Stock"},{key:"category",label:"Category"},{key:"created_at",label:"Created",type:"date"},{key:"actions",label:"Actions",type:"actions"}],formFields:[{key:"name",label:"Name",type:"text"},{key:"description",label:"Description",type:"text"},{key:"price",label:"Price",type:"number"},{key:"stock",label:"Stock",type:"number"},{key:"category",label:"Category",type:"select",options:[{value:"Electronics",label:"Electronics"},{value:"Clothing",label:"Clothing"},{value:"Books",label:"Books"},{value:"Home",label:"Home"},{value:"Sports",label:"Sports"},{value:"Other",label:"Other"}]}]}}onStatsUpdate(e){this.statsChange.emit(e)}};d([(0,r.pde)()],c.prototype,"items",2),d([(0,r.k7i)()],c.prototype,"statsChange",2),c=d([(0,r.uAl)({selector:"app-duckdb-products",standalone:!0,imports:[i.MD,n.u],template:`
    <app-data-table
      [config]="productConfig"
      [items]="items"
      (statsChange)="onStatsUpdate($event)"
    ></app-data-table>
  `})],c)},7594(e,t,o){o.d(t,{v:()=>c});var a=o(9701),r=o(390),i=o(106),n=o(5807),s=Object.defineProperty,l=Object.getOwnPropertyDescriptor,d=(e,t,o,a)=>{for(var r,i=a>1?void 0:a?l(t,o):t,n=e.length-1;n>=0;n--)(r=e[n])&&(i=(a?r(t,o,i):r(i))||i);return a&&i&&s(t,o,i),i};let c=class{constructor(){this.items=[],this.statsChange=new a.bkB,this.userConfig={entityName:"User",entityNamePlural:"Users",icon:"\uD83D\uDC65",columns:[{key:"id",label:"ID",width:"60px"},{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"role",label:"Role"},{key:"status",label:"Status",type:"status"},{key:"created_at",label:"Created",type:"date"},{key:"actions",label:"Actions",type:"actions"}],formFields:[{key:"name",label:"Name",type:"text"},{key:"email",label:"Email",type:"text"},{key:"role",label:"Role",type:"select",options:[{value:"User",label:"User"},{value:"Admin",label:"Admin"},{value:"Manager",label:"Manager"}]},{key:"status",label:"Status",type:"select",options:[{value:"Active",label:"Active"},{value:"Inactive",label:"Inactive"}]}]}}onStatsUpdate(e){this.statsChange.emit(e)}};d([(0,r.pde)()],c.prototype,"items",2),d([(0,r.k7i)()],c.prototype,"statsChange",2),c=d([(0,r.uAl)({selector:"app-duckdb-users",standalone:!0,imports:[i.MD,n.u],template:`
    <app-data-table
      [config]="userConfig"
      [items]="items"
      (statsChange)="onStatsUpdate($event)"
    ></app-data-table>
  `})],c)},5807(e,t,o){o.d(t,{u:()=>m});var a=o(9701),r=o(390),i=o(106),n=o(9582),s=o(769),l=o(5317),d=Object.defineProperty,c=Object.getOwnPropertyDescriptor,p=(e,t,o,a)=>{for(var r,i=a>1?void 0:a?c(t,o):t,n=e.length-1;n>=0;n--)(r=e[n])&&(i=(a?r(t,o,i):r(i))||i);return a&&i&&d(t,o,i),i};let m=class{constructor(){this.api=(0,a.WQX)(s.G),this.logger=(0,a.WQX)(l.g),this.config=null,this.items=[],this.itemsChange=new a.bkB,this.statsChange=new a.bkB,this.filteredItems=[],this.searchQuery="",this.showModal=!1,this.editingItem=null,this.formData={},this.isLoading=!1}ngOnInit(){this.filterItems()}ngOnChanges(){this.filterItems()}filterItems(){let e=this.searchQuery.toLowerCase();if(!e){this.filteredItems=[...this.items];return}this.filteredItems=this.items.filter(t=>Object.values(t).some(t=>null!=t&&String(t).toLowerCase().includes(e)))}formatDate(e){return e?new Date(e).toLocaleDateString():""}showCreateModal(){if(this.editingItem=null,this.formData={},this.config?.formFields)for(let e of this.config.formFields)this.formData[e.key]="number"===e.type?0:"";this.showModal=!0}editItem(e){this.editingItem={...e},this.formData={...e},this.showModal=!0}closeModal(){this.showModal=!1,this.editingItem=null}async saveItem(){if(this.config){this.isLoading=!0;try{this.editingItem?await this.api.callOrThrow(`update${this.config.entityName}`,[this.editingItem.id,...this.config.formFields.map(e=>this.formData[e.key])]):await this.api.callOrThrow(`create${this.config.entityName}`,this.config.formFields.map(e=>this.formData[e.key])),this.closeModal(),this.statsChange.emit({type:`total${this.config.entityNamePlural}`,count:this.items.length})}catch(e){this.logger.error(`Failed to save ${this.config.entityName}`,e)}finally{this.isLoading=!1}}}async deleteItem(e){if(this.config&&confirm(`Delete ${e.name||e.customer_name||"item"}?`)){this.isLoading=!0;try{await this.api.callOrThrow(`delete${this.config.entityName}`,[e.id]),this.statsChange.emit({type:`total${this.config.entityNamePlural}`,count:this.items.length-1})}catch(e){this.logger.error(`Failed to delete ${this.config.entityName}`,e)}finally{this.isLoading=!1}}}};p([(0,r.pde)()],m.prototype,"config",2),p([(0,r.pde)()],m.prototype,"items",2),p([(0,r.k7i)()],m.prototype,"itemsChange",2),p([(0,r.k7i)()],m.prototype,"statsChange",2),m=p([(0,r.uAl)({selector:"app-data-table",standalone:!0,imports:[i.MD,n.YN],template:`
    <div class="table-card">
      <div class="card-header">
        <div class="header-left">
          <h2 class="card-title">
            <span class="title-icon">{{ config?.icon || '\u{1F4CB}' }}</span>
            {{ config?.entityNamePlural || 'Items' }} Management
          </h2>
          <span class="record-count">{{ filteredItems.length }} records</span>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">\u{1F50D}</span>
            <input
              type="text"
              class="search-input"
              placeholder="Search..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterItems()"
            />
          </div>
          <button class="btn btn-primary" (click)="showCreateModal()">
            <span class="btn-icon">+</span> Add {{ config?.entityName || 'Item' }}
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              @for (col of config?.columns || []; track col.key) {
                <th [style.width]="col.width || 'auto'">{{ col.label }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @if (filteredItems.length === 0) {
              <tr>
                <td [attr.colspan]="config?.columns?.length || 1" class="empty-state">
                  No {{ config?.entityNamePlural?.toLowerCase() || 'items' }} found
                </td>
              </tr>
            } @else {
              @for (item of filteredItems; track item.id) {
                <tr>
                  @for (col of config?.columns || []; track col.key) {
                    <td>
                      @if (col.type === 'actions') {
                        <div class="action-buttons">
                          <button class="btn btn--icon btn--edit" (click)="editItem(item)">\u270F\uFE0F</button>
                          <button class="btn btn--icon btn--delete" (click)="deleteItem(item)">\u{1F5D1}\uFE0F</button>
                        </div>
                      } @else if (col.type === 'date') {
                        {{ formatDate(item[col.key]) }}
                      } @else if (col.type === 'status') {
                        <span class="status-badge" [class]="'status-' + item[col.key]">
                          {{ item[col.key] }}
                        </span>
                      } @else {
                        {{ item[col.key] }}
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showModal) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingItem ? 'Edit' : 'Create New' }} {{ config?.entityName || 'Item' }}</h3>
            <button class="btn btn--icon" (click)="closeModal()">\u2715</button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="saveItem()" #itemForm="ngForm">
              @for (field of config?.formFields || []; track field.key) {
                <div class="form-group">
                  <label>{{ field.label }}</label>
                  @if (field.type === 'select') {
                    <select
                      [(ngModel)]="formData[field.key]"
                      [name]="field.key"
                      class="form-control"
                      required
                    >
                      @for (option of field.options || []; track option.value) {
                        <option [value]="option.value">{{ option.label }}</option>
                      }
                    </select>
                  } @else if (field.type === 'date') {
                    <input
                      type="date"
                      [(ngModel)]="formData[field.key]"
                      [name]="field.key"
                      class="form-control"
                    />
                  } @else if (field.type === 'number') {
                    <input
                      type="number"
                      [(ngModel)]="formData[field.key]"
                      [name]="field.key"
                      class="form-control"
                      required
                    />
                  } @else {
                    <input
                      type="text"
                      [(ngModel)]="formData[field.key]"
                      [name]="field.key"
                      class="form-control"
                      required
                    />
                  }
                </div>
              }
              <div class="modal-actions">
                <button type="button" class="btn btn--secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn--primary" [disabled]="itemForm.invalid || isLoading">
                  {{ isLoading ? 'Saving...' : (editingItem ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,styles:[`
    .table-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.3);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
    .title-icon { font-size: 2rem; }
    .record-count { font-size: 0.9rem; color: #94a3b8; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .search-box { display: flex; align-items: center; gap: 6px; }
    .search-icon { font-size: 1rem; }
    .search-input {
      padding: 8px 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      background: rgba(30, 41, 59, 0.8);
      color: #fff;
      width: 200px;
      font-size: 0.9rem;
    }
    .search-input::placeholder { color: #94a3b8; }
    .search-input:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #fff;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
    }
    .btn--secondary {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .btn--icon {
      width: 32px;
      height: 32px;
      padding: 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #94a3b8;
    }
    .btn--edit { color: #10b981; }
    .btn--delete { color: #ef4444; }
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .data-table th {
      background: rgba(15, 23, 42, 0.2);
      font-weight: 600;
      color: #e2e8f0;
      font-size: 0.9rem;
    }
    .data-table td { color: #e2e8f0; font-size: 0.9rem; }
    .data-table tr:hover { background: rgba(59, 130, 246, 0.1); }
    .empty-state { text-align: center; padding: 32px; color: #94a3b8; }
    .action-buttons { display: flex; gap: 6px; }
    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .status-active, .status-delivered { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-inactive, .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .status-pending, .status-processing { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .status-shipped { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: rgba(15, 23, 42, 0.95);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .modal-header h3 { margin: 0; font-size: 1.5rem; color: #fff; }
    .modal-body { padding: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; color: #e2e8f0; font-size: 0.9rem; }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      background: rgba(30, 41, 59, 0.8);
      color: #fff;
      font-size: 0.9rem;
    }
    .form-control:focus {
      outline: none;
      border-color: rgba(59, 130, 246, 0.5);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid rgba(148, 163, 184, 0.1);
    }
  `]})],m)},4253(e,t,o){o(2229),"u">typeof window&&window.WinBox?console.debug("WinBox loaded and available on window.WinBox"):console.warn("WinBox was imported but not found on window object")}},function(e){e.O(0,["132","135","176","184","227","245","301","313","34","355","389","439","440","454","520","577","622","63","666","675","686","706","760","79","823","880","969"],function(){return e(e.s=4190)}),e.O()}]);
//# sourceMappingURL=main~3.a5724ba3a1044bc8.js.map