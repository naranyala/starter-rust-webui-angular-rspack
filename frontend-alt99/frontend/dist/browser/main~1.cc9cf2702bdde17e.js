"use strict";(self.webpackChunkangular_rspack_demo=self.webpackChunkangular_rspack_demo||[]).push([["520"],{746(t,e,a){a(8216),a(5702),a(4253);var i=a(5008),r=a(4953),s=a(5286),o=a(9701),n=a(390),c=a(3380),l=a(106),d=a(5317),p=a(6971),g=a(1834),u=a(5397),h=a(6950),m=a(9582),f=a(2541),b=a(9309),v=a(1501);let x=["Electronics","Clothing","Books","Home","Sports","Office","Other"],y={Electronics:"\uD83D\uDCF1",Clothing:"\uD83D\uDC55",Books:"\uD83D\uDCDA",Home:"\uD83C\uDFE0",Sports:"⚽",Office:"\uD83D\uDCCE",Other:"\uD83D\uDCE6"},w=class{constructor(){this.logger=(0,o.WQX)(d.g),this.backend=(0,o.WQX)(f.m3),this.confirmModal=(0,o.WQX)(f.Rj),this.categories=x,this.CATEGORY_ICONS=y,this.isLoading=(0,o.vPA)(!1),this.saving=(0,o.vPA)(!1),this.showModal=(0,o.vPA)(!1),this.isEditing=(0,o.vPA)(!1),this.errorMessage=(0,o.vPA)(""),this.selectedProduct=(0,o.vPA)(null),this.products=(0,o.vPA)([]),this.filteredProducts=(0,o.vPA)([]),this.productStats=(0,h.EW)(()=>{let t=this.products(),e=new Set(t.map(t=>t.category)),a=t.reduce((t,e)=>t+e.stock,0),i=t.length>0?t.reduce((t,e)=>t+e.price,0)/t.length:0,r=t.filter(t=>t.stock>0&&t.stock<10).length,s=t.filter(t=>0===t.stock).length;return{totalProducts:t.length,totalCategories:e.size,totalStock:a,avgPrice:Math.round(100*i)/100,lowStockCount:r,outOfStockCount:s}}),this.filters=(0,o.vPA)({search:"",category:"",stockStatus:"all",sortBy:"name",sortOrder:"asc"}),this.formData={name:"",description:"",price:0,category:"Electronics",stock:0}}ngOnInit(){this.loadProducts()}async loadProducts(){this.isLoading.set(!0);try{let t=await this.backend.callOrThrow(b.h.Products.GET_ALL).catch(()=>[]);this.products.set(t),this.applyFilters(),this.logger.info(`Loaded ${t.length} products`)}catch(t){this.logger.error("Failed to load products",t),this.errorMessage.set("Failed to load products. Please try again.")}finally{this.isLoading.set(!1)}}applyFilters(){let t=[...this.products()],{search:e,category:a,stockStatus:i,sortBy:r,sortOrder:s}=this.filters();if(e.trim()){let a=e.toLowerCase();t=t.filter(t=>t.name.toLowerCase().includes(a)||t.description.toLowerCase().includes(a))}a&&(t=t.filter(t=>t.category===a)),"all"!==i&&(t=t.filter(t=>{switch(i){case"in-stock":return t.stock>=10;case"low-stock":return t.stock>0&&t.stock<10;case"out-of-stock":return 0===t.stock;default:return!0}})),t.sort((t,e)=>{let a=0;switch(r){case"name":a=t.name.localeCompare(e.name);break;case"price":a=t.price-e.price;break;case"stock":a=t.stock-e.stock;break;case"category":a=t.category.localeCompare(e.category)}return"asc"===s?a:-a}),this.filteredProducts.set(t)}toggleSortOrder(){this.filters.update(t=>({...t,sortOrder:"asc"===t.sortOrder?"desc":"asc"})),this.applyFilters()}getCategoryColor(t){return({Electronics:"electronics",Clothing:"clothing",Books:"books",Home:"home",Sports:"sports",Office:"office",Other:"other"})[t]||"other"}getStockStatus(t){return 0===t?"out-of-stock":t<10?"low-stock":"in-stock"}showCreateModal(){this.isEditing.set(!1),this.formData={name:"",description:"",price:0,category:"Electronics",stock:0},this.errorMessage.set(""),this.showModal.set(!0)}editProduct(t){this.isEditing.set(!0),this.selectedProduct.set(t),this.formData={name:t.name,description:t.description,price:t.price,category:t.category,stock:t.stock},this.errorMessage.set(""),this.showModal.set(!0)}closeModal(){this.showModal.set(!1),this.errorMessage.set(""),this.selectedProduct.set(null)}async saveProduct(){if(!this.formData.name?.trim())return void this.errorMessage.set("Product name is required");if(!this.formData.price||this.formData.price<=0)return void this.errorMessage.set("Price must be greater than 0");if(void 0===this.formData.stock||this.formData.stock<0)return void this.errorMessage.set("Stock must be 0 or greater");this.saving.set(!0),this.errorMessage.set("");try{if(this.isEditing()){let t=this.selectedProduct()?.id||0;await this.backend.callOrThrow(b.h.Products.UPDATE,[t,this.formData.name,this.formData.description,this.formData.price,this.formData.category,this.formData.stock]),this.logger.info("Product updated successfully")}else await this.backend.callOrThrow(b.h.Products.CREATE,[this.formData.name,this.formData.description,this.formData.price,this.formData.category,this.formData.stock]),this.logger.info("Product created successfully");await this.loadProducts(),this.closeModal()}catch(t){this.logger.error("Failed to save product",t),this.errorMessage.set(t.message||"Failed to save product")}finally{this.saving.set(!1)}}async deleteProduct(t){if(!await this.confirmModal.showDeleteConfirm({title:"Delete Product",itemName:t.name,itemDescription:t.description,additionalInfo:`<strong>Price:</strong> $${t.price.toFixed(2)} | <strong>Stock:</strong> ${t.stock} units | <strong>Category:</strong> ${t.category}`,confirmText:`DELETE ${t.name.toUpperCase()}`}))return void this.logger.info("Delete cancelled by user");try{await this.backend.callOrThrow(b.h.Products.DELETE,[t.id]),this.logger.info("Product deleted successfully"),await this.loadProducts()}catch(t){this.logger.error("Failed to delete product",t),this.errorMessage.set(t.message||"Failed to delete product")}}};w=((t,e)=>{for(var a,i=e,r=t.length-1;r>=0;r--)(a=t[r])&&(i=a(i)||i);return i})([(0,n.uAl)({selector:"app-duckdb-products-demo",standalone:!0,imports:[l.MD,m.YN,v.Qp,v.HJ,v.nS,v.tI,v.os,v.ib,v.lM,v.Rj],template:`
    <div class="duckdb-demo">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">\u{1F986}</span>
            <div class="header-text">
              <h1 class="page-title">Product Catalog</h1>
              <p class="page-subtitle">DuckDB-powered inventory management with real-time analytics</p>
            </div>
          </div>
          <div class="header-actions">
            <app-button
              variant="primary"
              icon="\u2795"
              label="Add Product"
              (click)="showCreateModal()"
            />
          </div>
        </div>
      </header>

      <!-- Statistics Dashboard -->
      <section class="stats-section">
        <app-stats-card
          value="{{ productStats().totalProducts }}"
          label="Total Products"
          icon="\u{1F4E6}"
          variant="primary"
        />
        <app-stats-card
          value="{{ productStats().totalCategories }}"
          label="Categories"
          icon="\u{1F3F7}\uFE0F"
          variant="success"
        />
        <app-stats-card
          value="{{ productStats().totalStock }}"
          label="Total Stock"
          icon="\u{1F4CA}"
          variant="warning"
        />
        <app-stats-card
          value="\${{ productStats().avgPrice }}"
          label="Avg Price"
          icon="\u{1F4B0}"
          variant="info"
        />
        <app-stats-card
          value="{{ productStats().lowStockCount }}"
          label="Low Stock"
          icon="\u26A0\uFE0F"
          variant="warning"
        />
        <app-stats-card
          value="{{ productStats().outOfStockCount }}"
          label="Out of Stock"
          icon="\u274C"
          variant="danger"
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
              placeholder="Search products by name or description..."
              [(ngModel)]="filters().search"
              (input)="applyFilters()"
            />
          </div>
          
          <div class="filters-group">
            <select
              class="filter-select"
              [(ngModel)]="filters().category"
              (change)="applyFilters()"
            >
              <option value="">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ CATEGORY_ICONS[cat] }} {{ cat }}</option>
              }
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().stockStatus"
              (change)="applyFilters()"
            >
              <option value="all">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (&lt;10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            <select
              class="filter-select"
              [(ngModel)]="filters().sortBy"
              (change)="applyFilters()"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
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
              (click)="loadProducts()"
            />
          </div>
        </div>
      </section>

      <!-- Products Grid -->
      <section class="products-section">
        @if (isLoading()) {
          <div class="loading-container">
            <app-spinner size="lg" label="Loading products..." />
          </div>
        } @else if (filteredProducts().length === 0) {
          <app-empty-state
            icon="\u{1F4ED}"
            title="No products found"
            description="Try adjusting your search or filters, or add a new product to get started."
          >
            <app-button
              variant="primary"
              icon="\u2795"
              label="Add Product"
              (click)="showCreateModal()"
            />
          </app-empty-state>
        } @else {
          <div class="products-grid">
            @for (product of filteredProducts(); track product.id) {
              <app-card hoverable class="product-card">
                <div class="product-card-header" [class]="'category-' + getCategoryColor(product.category)">
                  <div class="product-category">
                    <span class="category-icon">{{ CATEGORY_ICONS[product.category] || '\u{1F4E6}' }}</span>
                    <span class="category-name">{{ product.category }}</span>
                  </div>
                  <div class="product-stock-indicator" [class]="'stock-' + getStockStatus(product.stock)">
                    @if (getStockStatus(product.stock) === 'in-stock') {
                      <span class="stock-dot"></span>
                      <span class="stock-text">{{ product.stock }} in stock</span>
                    } @else if (getStockStatus(product.stock) === 'low-stock') {
                      <span class="stock-dot low"></span>
                      <span class="stock-text">Only {{ product.stock }} left</span>
                    } @else {
                      <span class="stock-dot out"></span>
                      <span class="stock-text">Out of stock</span>
                    }
                  </div>
                </div>

                <div class="product-card-body">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ product.description || 'No description available' }}</p>
                </div>

                <app-card-footer bordered>
                  <div class="product-price">\${{ product.price | number:'1.2-2' }}</div>
                  <div class="product-actions">
                    <button
                      class="action-btn btn-edit"
                      (click)="editProduct(product)"
                      title="Edit Product"
                    >
                      \u270F\uFE0F
                    </button>
                    <button
                      class="action-btn btn-delete"
                      (click)="deleteProduct(product)"
                      title="Delete Product"
                    >
                      \u{1F5D1}\uFE0F
                    </button>
                  </div>
                </app-card-footer>
              </app-card>
            }
          </div>
        }

        <!-- Results Footer -->
        @if (filteredProducts().length > 0) {
          <div class="results-footer">
            <span class="results-count">
              Showing {{ filteredProducts().length }} of {{ products().length }} products
            </span>
          </div>
        }
      </section>

      <!-- Create/Edit Modal -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">{{ isEditing() ? '\u270F\uFE0F' : '\u2795' }}</span>
                <h2 class="modal-title">{{ isEditing() ? 'Edit Product' : 'Create New Product' }}</h2>
              </div>
              <button class="modal-close" (click)="closeModal()">\u2715</button>
            </div>

            <form class="modal-form" (ngSubmit)="saveProduct()">
              <div class="form-grid">
                <div class="form-group form-group-full">
                  <label class="form-label">
                    Product Name
                    <span class="required">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-input"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    placeholder="Enter product name"
                    autocomplete="off"
                  />
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Description</label>
                  <textarea
                    class="form-input form-textarea"
                    [(ngModel)]="formData.description"
                    name="description"
                    placeholder="Product description"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Price
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-prefix">
                    <span class="input-prefix">$</span>
                    <input
                      type="number"
                      class="form-input"
                      [(ngModel)]="formData.price"
                      name="price"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Stock Quantity
                    <span class="required">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-input"
                    [(ngModel)]="formData.stock"
                    name="stock"
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div class="form-group form-group-full">
                  <label class="form-label">Category</label>
                  <select class="form-input" [(ngModel)]="formData.category" name="category">
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ CATEGORY_ICONS[cat] }} {{ cat }}</option>
                    }
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
                  [label]="saving() ? 'Saving...' : (isEditing() ? 'Update Product' : 'Create Product')"
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
    .duckdb-demo {
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
      grid-template-columns: repeat(6, 1fr);
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

    /* Products Section */
    .products-section {
      position: relative;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .product-card {
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .product-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.15));
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .product-category {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-icon {
      font-size: 18px;
    }

    .category-name {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-stock-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      padding: 4px 10px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 12px;
    }

    .stock-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      animation: pulse 2s infinite;
    }

    .stock-dot.low {
      background: #f59e0b;
    }

    .stock-dot.out {
      background: #ef4444;
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .stock-text {
      color: #94a3b8;
      font-weight: 500;
    }

    .product-card-body {
      padding: 18px;
    }

    .product-name {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 8px;
      line-height: 1.3;
    }

    .product-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-price {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      line-height: 1;
    }

    .product-actions {
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

    .results-footer {
      display: flex;
      justify-content: center;
      padding: 20px;
      margin-top: 24px;
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
      max-width: 650px;
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

    .form-group-full {
      grid-column: 1 / -1;
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

    .form-textarea {
      resize: vertical;
      min-height: 80px;
      font-family: inherit;
    }

    .input-with-prefix {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-prefix {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      font-weight: 600;
      pointer-events: none;
    }

    .input-with-prefix .form-input {
      padding-left: 32px;
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
    @media (max-width: 1400px) {
      .stats-section {
        grid-template-columns: repeat(3, 1fr);
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

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .duckdb-demo {
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
        grid-template-columns: repeat(2, 1fr);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]})],w);let k=class{constructor(){this.logger=(0,o.WQX)(d.g),this.api=(0,o.WQX)(p.G),this.isLoading=(0,o.vPA)(!1),this.selectedPeriod=(0,o.vPA)("daily"),this.products=(0,o.vPA)([]),this.categoryStats=(0,o.vPA)([]),this.topProducts=(0,o.vPA)([]),this.salesTrend=(0,o.vPA)([]),this.revenueData=(0,o.vPA)([]),this.metrics=(0,o.vPA)({totalProducts:0,totalCategories:0,totalStock:0,avgPrice:0,totalRevenue:0,totalOrders:0}),this.maxCategoryCount=0,this.maxRevenue=0}ngOnInit(){this.loadData()}async loadData(){this.isLoading.set(!0);try{let[t,e,a,i,r]=await Promise.all([this.api.callOrThrow("getProducts").catch(()=>[]),this.api.callOrThrow("getCategoryStats").catch(()=>[]),this.api.callOrThrow("getTopProducts",[10]).catch(()=>[]),this.api.callOrThrow("getSalesTrend",[30]).catch(()=>[]),this.api.callOrThrow("getRevenueByPeriod",[this.selectedPeriod()]).catch(()=>[])]);this.products.set(t),this.categoryStats.set(e),this.topProducts.set(a),this.salesTrend.set(i),this.revenueData.set(r),this.calculateMetrics(t),this.maxCategoryCount=Math.max(...e.map(t=>t.product_count),1),this.maxRevenue=Math.max(...i.map(t=>t.total_revenue),1)}catch(t){this.logger.error("Failed to load analytics data",t)}finally{this.isLoading.set(!1)}}calculateMetrics(t){let e=t.length,a=new Set(t.map(t=>t.category)),i=t.reduce((t,e)=>t+e.stock,0),r=e>0?t.reduce((t,e)=>t+e.price,0)/e:0;this.metrics.update(t=>({...t,totalProducts:e,totalCategories:a.size,totalStock:i,avgPrice:r}))}getCategoryPercentage(t){return t/this.maxCategoryCount*100}getTrendBarHeight(t){return t/this.maxRevenue*100}formatTrendDate(t){return new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}getAvgTransaction(t){return t.transactions>0?t.revenue/t.transactions:0}getGrowth(t,e){if(0===e.revenue)return"—";let a=(t.revenue-e.revenue)/e.revenue*100,i=a>=0?"+":"";return`${i}${a.toFixed(1)}%`}};k=((t,e)=>{for(var a,i=e,r=t.length-1;r>=0;r--)(a=t[r])&&(i=a(i)||i);return i})([(0,n.uAl)({selector:"app-duckdb-analytics-demo",standalone:!0,imports:[l.MD],template:`
    <div class="analytics-container">
      <!-- Header -->
      <div class="analytics-header">
        <div class="header-content">
          <h1 class="analytics-title">
            <span class="title-icon">\u{1F986}</span>
            DuckDB Analytics Dashboard
          </h1>
          <p class="analytics-description">
            High-performance analytical queries and business intelligence
          </p>
        </div>
        <div class="header-actions">
          <select class="period-select" [(ngModel)]="selectedPeriod" (change)="loadData()">
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="metrics-grid">
        <div class="metric-card metric-primary">
          <div class="metric-icon">\u{1F4E6}</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalProducts }}</span>
            <span class="metric-label">Total Products</span>
          </div>
        </div>
        
        <div class="metric-card metric-success">
          <div class="metric-icon">\u{1F3F7}\uFE0F</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalCategories }}</span>
            <span class="metric-label">Categories</span>
          </div>
        </div>
        
        <div class="metric-card metric-warning">
          <div class="metric-icon">\u{1F4CA}</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalStock | number }}</span>
            <span class="metric-label">Total Stock</span>
          </div>
        </div>
        
        <div class="metric-card metric-info">
          <div class="metric-icon">\u{1F4B0}</div>
          <div class="metric-content">
            <span class="metric-value">\${{ metrics().avgPrice | number:'1.2-2' }}</span>
            <span class="metric-label">Avg Price</span>
          </div>
        </div>
        
        <div class="metric-card metric-revenue">
          <div class="metric-icon">\u{1F4B5}</div>
          <div class="metric-content">
            <span class="metric-value">\${{ metrics().totalRevenue | number:'1.2-2' }}</span>
            <span class="metric-label">Total Revenue</span>
          </div>
        </div>
        
        <div class="metric-card metric-orders">
          <div class="metric-icon">\u{1F6D2}</div>
          <div class="metric-content">
            <span class="metric-value">{{ metrics().totalOrders | number }}</span>
            <span class="metric-label">Total Orders</span>
          </div>
        </div>
      </div>

      <!-- Category Statistics -->
      <div class="analytics-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">\u{1F4C8}</span>
            Category Statistics
          </h2>
        </div>
        
        @if (categoryStats().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">\u{1F4ED}</span>
            <span>No category data available</span>
          </div>
        } @else {
          <div class="category-grid">
            @for (stat of categoryStats(); track stat.category) {
              <div class="category-card">
                <div class="category-header">
                  <span class="category-name">{{ stat.category }}</span>
                  <span class="category-count">{{ stat.product_count }} products</span>
                </div>
                <div class="category-stats">
                  <div class="category-stat">
                    <span class="stat-label">Avg Price</span>
                    <span class="stat-value">\${{ stat.avg_price | number:'1.2-2' }}</span>
                  </div>
                  <div class="category-stat">
                    <span class="stat-label">Total Stock</span>
                    <span class="stat-value">{{ stat.total_stock }}</span>
                  </div>
                  <div class="category-stat">
                    <span class="stat-label">Price Range</span>
                    <span class="stat-value">\${{ stat.min_price }} - \${{ stat.max_price }}</span>
                  </div>
                </div>
                <div class="category-bar">
                  <div class="category-bar-fill" 
                       [style.width.%]="getCategoryPercentage(stat.product_count)">
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Top Products & Sales Trend -->
      <div class="analytics-row">
        <!-- Top Products -->
        <div class="analytics-section analytics-section-half">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">\u{1F3C6}</span>
              Top Products by Revenue
            </h2>
          </div>
          
          @if (topProducts().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">\u{1F4ED}</span>
              <span>No product data available</span>
            </div>
          } @else {
            <div class="top-products-list">
              @for (product of topProducts(); track product.id; let i = $index) {
                <div class="top-product-item">
                  <div class="product-rank">
                    <span class="rank-number">{{ i + 1 }}</span>
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-category">{{ product.category }}</div>
                  </div>
                  <div class="product-metrics">
                    <div class="product-metric">
                      <span class="metric-label">Sold</span>
                      <span class="metric-value">{{ product.total_sold }}</span>
                    </div>
                    <div class="product-metric product-metric-revenue">
                      <span class="metric-label">Revenue</span>
                      <span class="metric-value">\${{ product.total_revenue | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Sales Trend -->
        <div class="analytics-section analytics-section-half">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">\u{1F4C9}</span>
              Sales Trend (30 Days)
            </h2>
          </div>
          
          @if (salesTrend().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">\u{1F4ED}</span>
              <span>No sales data available</span>
            </div>
          } @else {
            <div class="trend-chart">
              @for (item of salesTrend(); track item.date; let i = $index) {
                <div class="trend-bar-container">
                  <div class="trend-bar" 
                       [style.height.%]="getTrendBarHeight(item.total_revenue)">
                  </div>
                  <div class="trend-label">
                    <span class="trend-date">{{ formatTrendDate(item.date) }}</span>
                    <span class="trend-value">\${{ item.total_revenue | number:'1.2-2' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Revenue by Period -->
      <div class="analytics-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">\u{1F4B9}</span>
            Revenue by {{ selectedPeriod }}
          </h2>
        </div>
        
        @if (revenueData().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">\u{1F4ED}</span>
            <span>No revenue data available</span>
          </div>
        } @else {
          <div class="revenue-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Transactions</th>
                  <th>Avg Transaction</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                @for (item of revenueData(); track item.period; let i = $index) {
                  <tr>
                    <td class="cell-period">{{ item.period }}</td>
                    <td class="cell-revenue">\${{ item.revenue | number:'1.2-2' }}</td>
                    <td class="cell-transactions">{{ item.transactions | number }}</td>
                    <td class="cell-avg">\${{ getAvgTransaction(item) | number:'1.2-2' }}</td>
                    <td class="cell-growth">
                      <span class="growth-indicator" 
                            [class.growth-positive]="i === 0"
                            [class.growth-negative]="i > 0">
                        {{ i === 0 ? '\u2014' : getGrowth(item, revenueData()[i - 1]) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,styles:[`
    .analytics-container {
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100%;
    }
    
    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .analytics-title {
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
    
    .analytics-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }
    
    .period-select {
      padding: 10px 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .metric-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }
    
    .metric-icon {
      font-size: 32px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    
    .metric-primary .metric-icon { background: rgba(59, 130, 246, 0.2); }
    .metric-success .metric-icon { background: rgba(16, 185, 129, 0.2); }
    .metric-warning .metric-icon { background: rgba(245, 158, 11, 0.2); }
    .metric-info .metric-icon { background: rgba(6, 182, 212, 0.2); }
    .metric-revenue .metric-icon { background: rgba(34, 197, 94, 0.2); }
    .metric-orders .metric-icon { background: rgba(139, 92, 246, 0.2); }
    
    .metric-content {
      display: flex;
      flex-direction: column;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
    }
    
    .metric-label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    .analytics-section {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    
    .analytics-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .section-header {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .section-icon {
      font-size: 20px;
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
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    
    .category-card {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 16px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .category-name {
      font-weight: 600;
      color: #fff;
      font-size: 16px;
    }
    
    .category-count {
      font-size: 12px;
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .category-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .category-stat {
      text-align: center;
    }
    
    .category-stat .stat-label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    
    .category-stat .stat-value {
      display: block;
      font-size: 14px;
      color: #fff;
      font-weight: 600;
    }
    
    .category-bar {
      height: 4px;
      background: rgba(148, 163, 184, 0.2);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .category-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #3b82f6);
      border-radius: 2px;
      transition: width 0.3s;
    }
    
    .top-products-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .top-product-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 8px;
    }
    
    .product-rank {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border-radius: 8px;
      font-weight: 700;
      color: #fff;
    }
    
    .rank-number {
      font-size: 16px;
    }
    
    .product-info {
      flex: 1;
    }
    
    .product-name {
      font-weight: 600;
      color: #fff;
      font-size: 14px;
    }
    
    .product-category {
      font-size: 12px;
      color: #94a3b8;
    }
    
    .product-metrics {
      display: flex;
      gap: 20px;
    }
    
    .product-metric {
      text-align: right;
    }
    
    .product-metric .metric-label {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    
    .product-metric .metric-value {
      display: block;
      font-size: 14px;
      color: #fff;
      font-weight: 600;
    }
    
    .product-metric-revenue .metric-value {
      color: #10b981;
    }
    
    .trend-chart {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 200px;
      padding: 16px;
      background: rgba(15, 23, 42, 0.3);
      border-radius: 8px;
    }
    
    .trend-bar-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    
    .trend-bar {
      width: 100%;
      min-height: 4px;
      background: linear-gradient(180deg, #06b6d4, #3b82f6);
      border-radius: 4px 4px 0 0;
      transition: height 0.3s;
    }
    
    .trend-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    
    .trend-date {
      font-size: 10px;
      color: #94a3b8;
      transform: rotate(-45deg);
      transform-origin: left;
    }
    
    .trend-value {
      font-size: 11px;
      color: #fff;
      font-weight: 600;
    }
    
    .revenue-table {
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
    
    .cell-revenue {
      color: #10b981;
      font-weight: 600;
    }
    
    .growth-indicator {
      font-weight: 600;
    }
    
    .growth-positive {
      color: #10b981;
    }
    
    .growth-negative {
      color: #ef4444;
    }
    
    @media (max-width: 1200px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      
      .analytics-row {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .analytics-header {
        flex-direction: column;
        gap: 16px;
      }
      
      .category-grid {
        grid-template-columns: 1fr;
      }
    }
  `]})],k);var D=a(3741),P=a(2761),C=a.n(P),S=Object.defineProperty,z=Object.getOwnPropertyDescriptor,M=(t,e,a,i)=>{for(var r,s=i>1?void 0:i?z(e,a):e,o=t.length-1;o>=0;o--)(r=t[o])&&(s=(i?r(e,a,s):r(s))||s);return i&&s&&S(e,a,s),s};let F=class{constructor(){this.logger=(0,o.WQX)(d.g),this.api=(0,o.WQX)(p.G),this.selectedChartType=(0,o.vPA)("bar"),this.animate=(0,o.vPA)(!0),this.chartData=(0,o.vPA)([{label:"Jan",value:4500,color:"#06b6d4"},{label:"Feb",value:5200,color:"#3b82f6"},{label:"Mar",value:4800,color:"#8b5cf6"},{label:"Apr",value:6100,color:"#10b981"},{label:"May",value:5900,color:"#f59e0b"},{label:"Jun",value:7200,color:"#ef4444"}]),this.totalValue=(0,o.vPA)(0),this.maxValue=(0,o.vPA)(0),this.minValue=(0,o.vPA)(0),this.avgValue=(0,o.vPA)(0)}ngOnInit(){this.calculateStats()}ngAfterViewInit(){this.initCharts(),this.renderCharts()}initCharts(){this.primaryChartRef?.nativeElement&&(this.primaryDraw=C()().addTo(this.primaryChartRef.nativeElement).size("100%","100%")),this.secondaryChartRef?.nativeElement&&(this.secondaryDraw=C()().addTo(this.secondaryChartRef.nativeElement).size("100%","100%"))}renderCharts(){this.clearCharts();let t=this.selectedChartType();"bar"===t?(this.renderBarChart(),this.renderBarChartSecondary()):"line"===t?(this.renderLineChart(),this.renderAreaChartSecondary()):"pie"===t?(this.renderPieChart(),this.renderDonutChartSecondary()):"area"===t&&(this.renderAreaChart(),this.renderStackedAreaSecondary())}clearCharts(){this.primaryDraw&&this.primaryDraw.clear(),this.secondaryDraw&&this.secondaryDraw.clear()}renderBarChart(){if(!this.primaryDraw)return;let t=this.chartData(),e=this.primaryDraw.width()||600,a=this.primaryDraw.height()||300,i=a-80,r=Math.max(...t.map(t=>t.value)),s=(e-80)/t.length-10;this.primaryDraw.line(40,40,40,a-40).stroke({width:2,color:"#475569"}),this.primaryDraw.line(40,a-40,e-40,a-40).stroke({width:2,color:"#475569"}),t.forEach((t,e)=>{let o=t.value/r*i,n=40+e*(s+10)+5,c=a-40-o,l=this.primaryDraw.rect(s,this.animate()?0:o);l.fill(t.color),l.move(n,this.animate()?a-40:c),this.animate()&&l.animate(1e3).size(s,o).move(n,c),this.primaryDraw.text(t.label).fill("#94a3b8").font("size",12).move(n+s/2-10,a-40+10),this.primaryDraw.text(t.value.toString()).fill("#fff").font("size",11).move(n+s/2-15,c-5)})}renderBarChartSecondary(){if(!this.secondaryDraw)return;let t=this.chartData().slice(0,4),e=this.secondaryDraw.width()||600;this.secondaryDraw.height();let a=e-80,i=Math.max(...t.map(t=>t.value));t.length,t.forEach((t,e)=>{let r=t.value/i*a,s=40+45*e,o=this.secondaryDraw.rect(this.animate()?0:r,30);o.fill(t.color).move(40,s),this.animate()&&o.animate(800).size(r,30),this.secondaryDraw.text(t.label).fill("#fff").font("size",13).move(35,s+8),this.secondaryDraw.text(t.value.toString()).fill("#94a3b8").font("size",12).move(40+r+10,s+8)})}renderLineChart(){if(!this.primaryDraw)return;let t=this.chartData(),e=this.primaryDraw.width()||600,a=this.primaryDraw.height()||300,i=e-80,r=a-80,s=Math.max(...t.map(t=>t.value)),o=Math.min(...t.map(t=>t.value)),n=s-o||1;this.primaryDraw.line(40,40,40,a-40).stroke({width:2,color:"#475569"}),this.primaryDraw.line(40,a-40,e-40,a-40).stroke({width:2,color:"#475569"});let c=t.map((e,s)=>({x:40+s/(t.length-1)*i,y:a-40-(e.value-o)/n*r,...e}));if(c.length>1){let t=c.map(t=>`${t.x},${t.y}`).join(" "),e=this.primaryDraw.polyline(t).fill("none").stroke({width:3,color:"#06b6d4"});this.animate()&&e.animate(1500).stroke({width:3,color:"#06b6d4"}),c.forEach((t,e)=>{let a=this.primaryDraw.circle(8).fill(t.color).move(t.x-4,t.y-4);this.animate()&&a.animate(500).delay(100*e).size(8,8).move(t.x-4,t.y-4)})}t.forEach((e,r)=>{let s=40+r/(t.length-1)*i;this.primaryDraw.text(e.label).fill("#94a3b8").font("size",12).move(s-10,a-40+10)})}renderAreaChartSecondary(){if(!this.secondaryDraw)return;let t=this.chartData().slice(0,5),e=this.secondaryDraw.width()||600,a=this.secondaryDraw.height()||300,i=e-80,r=a-80,s=Math.max(...t.map(t=>t.value)),o=t.map((e,o)=>({x:40+o/(t.length-1)*i,y:a-40-e.value/s*r}));if(o.length>1){let t=`M 40,${a-40} L ${o.map(t=>`${t.x},${t.y}`).join(" L ")} L ${40+i},${a-40} Z`,e=this.secondaryDraw.path(t).fill("#06b6d4").opacity(.3);this.animate()&&e.animate(1500).opacity(.3);let r=o.map(t=>`${t.x},${t.y}`).join(" ");this.secondaryDraw.polyline(r).fill("none").stroke({width:2,color:"#06b6d4"})}}renderPieChart(){if(!this.primaryDraw)return;let t=this.chartData(),e=this.primaryDraw.width()||600,a=this.primaryDraw.height()||300,i=e/2,r=a/2,s=Math.min(i,r)-40,o=t.reduce((t,e)=>t+e.value,0),n=-90;t.forEach((t,e)=>{let a=t.value/o*360,c=n+a,l=n*Math.PI/180,d=c*Math.PI/180,p=i+s*Math.cos(l),g=r+s*Math.sin(l),u=i+s*Math.cos(d),h=r+s*Math.sin(d),m=`M ${i},${r} L ${p},${g} A ${s},${s} 0 ${+(a>180)} 1 ${u},${h} Z`,f=this.primaryDraw.path(m).fill(t.color);this.animate()&&f.animate(800).delay(100*e).fill(t.color),n=c})}renderDonutChartSecondary(){if(!this.secondaryDraw)return;let t=this.chartData().slice(0,5),e=this.secondaryDraw.width()||600,a=this.secondaryDraw.height()||300,i=e/2,r=a/2,s=Math.min(i,r)-40,o=.6*s,n=t.reduce((t,e)=>t+e.value,0),c=-90;t.forEach((t,e)=>{let a=t.value/n*360,l=c+a,d=c*Math.PI/180,p=l*Math.PI/180,g=l*Math.PI/180,u=c*Math.PI/180,h=i+s*Math.cos(d),m=r+s*Math.sin(d),f=i+s*Math.cos(p),b=r+s*Math.sin(p),v=i+o*Math.cos(g),x=r+o*Math.sin(g),y=i+o*Math.cos(u),w=r+o*Math.sin(u),k=`M ${h},${m} A ${s},${s} 0 0 1 ${f},${b} L ${y},${w} A ${o},${o} 0 0 0 ${v},${x} Z`,D=this.secondaryDraw.path(k).fill(t.color);this.animate()&&D.animate(800).delay(100*e).fill(t.color),c=l})}renderAreaChart(){if(!this.primaryDraw)return;let t=this.chartData(),e=this.primaryDraw.width()||600,a=this.primaryDraw.height()||300,i=e-80,r=a-80,s=Math.max(...t.map(t=>t.value)),o=t.map((e,o)=>({x:40+o/(t.length-1)*i,y:a-40-e.value/s*r,...e}));if(o.length>1){let t=`M 40,${a-40} L ${o.map(t=>`${t.x},${t.y}`).join(" L ")} L ${40+i},${a-40} Z`,e=this.primaryDraw.gradient("linear").from(0,0).to(0,1);e.at(0,"#06b6d4",.8),e.at(1,"#06b6d4",.1);let r=this.primaryDraw.path(t).fill(e);this.animate()&&r.animate(1500).opacity(1);let s=o.map(t=>`${t.x},${t.y}`).join(" ");this.primaryDraw.polyline(s).fill("none").stroke({width:3,color:"#06b6d4"}),o.forEach((t,e)=>{let a=this.primaryDraw.circle(6).fill(t.color).move(t.x-3,t.y-3);this.animate()&&a.animate(500).delay(100*e).size(6,6).move(t.x-3,t.y-3)})}t.forEach((e,r)=>{let s=40+r/(t.length-1)*i;this.primaryDraw.text(e.label).fill("#94a3b8").font("size",12).move(s-10,a-40+10)})}renderStackedAreaSecondary(){if(!this.secondaryDraw)return;let t=this.chartData().slice(0,4),e=this.secondaryDraw.width()||600,a=this.secondaryDraw.height()||300,i=e-80,r=a-80,s=t.reduce((t,e)=>t+e.value,0),o=a-40;t.forEach((t,e)=>{let a=t.value/s*r,n=o-a,c=this.secondaryDraw.rect(i,this.animate()?0:a);c.fill(t.color).move(40,this.animate()?o:n),this.animate()&&c.animate(800).delay(100*e).size(i,a).move(40,n),this.secondaryDraw.text(t.label).fill("#fff").font("size",12).move(50,n+a/2+4),o=n})}calculateStats(){let t=this.chartData(),e=t.reduce((t,e)=>t+e.value,0),a=Math.max(...t.map(t=>t.value)),i=Math.min(...t.map(t=>t.value)),r=e/t.length;this.totalValue.set(e),this.maxValue.set(a),this.minValue.set(i),this.avgValue.set(r)}getPercentage(t){let e=this.totalValue();return e>0?t/e*100:0}toggleAnimation(){this.animate.update(t=>!t),this.animate()&&this.renderCharts()}refreshData(){this.chartData.update(t=>t.map(t=>({...t,value:Math.floor(t.value*(.8+.4*Math.random()))}))),this.calculateStats(),setTimeout(()=>this.renderCharts(),100)}addRandomData(){let t=["Jul","Aug","Sep","Oct","Nov","Dec"],e=["#06b6d4","#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"],a=t[Math.floor(Math.random()*t.length)],i=Math.floor(3e3+5e3*Math.random()),r=e[Math.floor(Math.random()*e.length)];this.chartData.update(t=>[...t,{label:a,value:i,color:r}]),this.calculateStats(),setTimeout(()=>this.renderCharts(),100)}removeData(t){this.chartData().length<=2?this.logger.warn("Minimum 2 data points required"):(this.chartData.update(e=>e.filter(e=>e.label!==t)),this.calculateStats(),setTimeout(()=>this.renderCharts(),100))}updateColor(t,e){t.color=e.target.value,this.chartData.update(t=>[...t]),setTimeout(()=>this.renderCharts(),100)}};M([(0,c.ViewChild)("primaryChart")],F.prototype,"primaryChartRef",2),M([(0,c.ViewChild)("secondaryChart")],F.prototype,"secondaryChartRef",2),F=M([(0,n.uAl)({selector:"app-charts-demo",standalone:!0,imports:[l.MD,m.YN],template:`
    <div class="demo-container">
      <!-- Header -->
      <div class="demo-header">
        <div class="header-content">
          <h1 class="demo-title">
            <span class="title-icon">\u{1F4C8}</span>
            Charts & Data Visualization
          </h1>
          <p class="demo-description">Interactive charts built with SVG.js</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="refreshData()">
            <span>\u{1F504}</span> Refresh Data
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
                {{ animate() ? '\u23F8\uFE0F' : '\u25B6\uFE0F' }}
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
          <div class="stat-icon">\u{1F4CA}</div>
          <div class="stat-content">
            <span class="stat-value">{{ totalValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Total Value</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">\u{1F4C8}</div>
          <div class="stat-content">
            <span class="stat-value">{{ maxValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Max Value</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">\u{1F4C9}</div>
          <div class="stat-content">
            <span class="stat-value">{{ minValue() | number:'1.0-0' }}</span>
            <span class="stat-label">Min Value</span>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">\u{1F522}</div>
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
                        \u{1F5D1}\uFE0F
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
  `,styles:[`
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
  `]})],F);var A=a(2040),T=a(333),E=a(9067),O=Object.defineProperty,$=Object.getOwnPropertyDescriptor,V=(t,e,a,i)=>{for(var r,s=i>1?void 0:i?$(e,a):e,o=t.length-1;o>=0;o--)(r=t[o])&&(s=(i?r(e,a,s):r(s))||s);return i&&s&&O(e,a,s),s};let I=class{constructor(){this.logger=(0,o.WQX)(d.g),this.backend=(0,o.WQX)(E.m),this.dbInfo=(0,o.vPA)(null),this.backups=(0,o.vPA)([]),this.integrityStatus=(0,o.vPA)(null),this.creatingBackup=(0,o.vPA)(!1),this.verifyingIntegrity=(0,o.vPA)(!1)}ngOnInit(){this.loadDatabaseInfo(),this.listBackups(),this.verifyIntegrity()}async loadDatabaseInfo(){try{let t=await this.backend.callOrThrow(b.h.Database.GET_INFO);t&&(this.dbInfo.set(t),this.logger.info("Database info loaded",t))}catch(t){this.logger.error("Failed to load database info",t)}}async listBackups(){try{let t=await this.backend.callOrThrow(b.h.Database.LIST_BACKUPS);t&&(this.backups.set(t),this.logger.info(`Found ${t.length} backups`))}catch(t){this.logger.error("Failed to list backups",t)}}async createBackup(){this.creatingBackup.set(!0);try{let t=await this.backend.callOrThrow(b.h.Database.CREATE_BACKUP);t&&(this.logger.info("Backup created",t),await this.loadDatabaseInfo(),await this.listBackups(),alert(`Backup created successfully!

${t.backupPath||t.backup_path}`))}catch(t){this.logger.error("Failed to create backup",t),alert(`Failed to create backup: ${t.message}`)}finally{this.creatingBackup.set(!1)}}async verifyIntegrity(){this.verifyingIntegrity.set(!0);try{let t=await this.backend.callOrThrow(b.h.Database.VERIFY_INTEGRITY);t&&(this.integrityStatus.set(t),this.logger.info("Integrity check complete",t),t.isValid||alert("⚠️ Database integrity issues detected!\n\n"+t.message))}catch(t){this.logger.error("Failed to verify integrity",t)}finally{this.verifyingIntegrity.set(!1)}}async restoreBackup(t){if(confirm(`\u26A0\uFE0F Restore Database

Are you sure you want to restore from this backup?

Backup: ${t.path}
Created: ${t.modifiedFormatted}

\u26A0\uFE0F This will replace your current database! A backup will be created before restoration.`))try{await this.backend.callOrThrow(b.h.Database.RESTORE_BACKUP,[t.path])&&(alert("✅ Database restored successfully!\n\nThe application will continue running with the restored data."),await this.loadDatabaseInfo(),await this.listBackups())}catch(t){this.logger.error("Failed to restore backup",t),alert(`Failed to restore backup: ${t.message}`)}}formatDate(t){return new Date(1e3*t).toLocaleString()}formatSize(t){return t>=1048576?`${(t/1048576).toFixed(2)} MB`:t>=1024?`${(t/1024).toFixed(2)} KB`:`${t} bytes`}};I=V([(0,n.uAl)({selector:"app-database-management",standalone:!0,imports:[l.MD,v.Qp,v.HJ,v.tI,v.nS],template:`
    <div class="db-management">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-branding">
            <span class="header-icon">\u{1F5C4}\uFE0F</span>
            <div class="header-text">
              <h1 class="page-title">Database Management</h1>
              <p class="page-subtitle">Backup, restore, and monitor your persistent data</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Database Info Cards -->
      @if (dbInfo()) {
        <section class="info-section">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Database Path</div>
              <div class="info-value">{{ dbInfo()!.path }}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Database Size</div>
              <div class="info-value">{{ dbInfo()!.sizeFormatted }}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Persistence Status</div>
              <div class="info-value">
                <app-badge [variant]="dbInfo()!.isPersistent ? 'success' : 'warning'" size="md">
                  {{ dbInfo()!.isPersistent ? '\u2713 Persistent' : '\u26A0 Temporary' }}
                </app-badge>
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">Last Modified</div>
              <div class="info-value">{{ formatDate(dbInfo()!.modified) }}</div>
            </div>
          </div>
        </section>

        <!-- Statistics -->
        <section class="stats-section">
          <app-stats-card
            value="{{ dbInfo()!.userCount }}"
            label="Total Users"
            icon="\u{1F465}"
            variant="primary"
          />
          <app-stats-card
            value="{{ dbInfo()!.productCount }}"
            label="Total Products"
            icon="\u{1F4E6}"
            variant="success"
          />
          <app-stats-card
            value="{{ dbInfo()!.orderCount }}"
            label="Total Orders"
            icon="\u{1F4CB}"
            variant="warning"
          />
          <app-stats-card
            value="{{ dbInfo()!.backupCount }}"
            label="Available Backups"
            icon="\u{1F4BE}"
            variant="info"
          />
        </section>

        <!-- Integrity Status -->
        @if (integrityStatus()) {
          <section class="integrity-section">
            <div class="integrity-card" [class.valid]="integrityStatus()!.isValid" [class.invalid]="!integrityStatus()!.isValid">
              <div class="integrity-header">
                <span class="integrity-icon">{{ integrityStatus()!.isValid ? '\u2705' : '\u274C' }}</span>
                <h3 class="integrity-title">Database Integrity</h3>
                <app-badge [variant]="integrityStatus()!.isValid ? 'success' : 'danger'" size="md">
                  {{ integrityStatus()!.isValid ? 'Healthy' : 'Issues Detected' }}
                </app-badge>
              </div>
              <div class="integrity-body">
                <p class="integrity-message">{{ integrityStatus()!.message }}</p>
                <p class="integrity-date">Last verified: {{ integrityStatus()!.lastVerifiedFormatted }}</p>
              </div>
            </div>
          </section>
        }
      } @else {
        <div class="loading-container">
          <app-spinner size="lg" label="Loading database information..." />
        </div>
      }

      <!-- Actions -->
      <section class="actions-section">
        <div class="action-cards">
          <!-- Create Backup -->
          <div class="action-card">
            <div class="action-icon">\u{1F4BE}</div>
            <h3 class="action-title">Create Backup</h3>
            <p class="action-description">Create a backup of your current database. This can be used to restore your data later.</p>
            <app-button
              variant="primary"
              [label]="creatingBackup() ? 'Creating...' : 'Create Backup'"
              [loading]="creatingBackup()"
              (click)="createBackup()"
            />
          </div>

          <!-- Verify Integrity -->
          <div class="action-card">
            <div class="action-icon">\u2705</div>
            <h3 class="action-title">Verify Integrity</h3>
            <p class="action-description">Check the database for corruption or errors. Recommended after unexpected shutdowns.</p>
            <app-button
              variant="secondary"
              [label]="verifyingIntegrity() ? 'Verifying...' : 'Verify Now'"
              [loading]="verifyingIntegrity()"
              (click)="verifyIntegrity()"
            />
          </div>

          <!-- Refresh Info -->
          <div class="action-card">
            <div class="action-icon">\u{1F504}</div>
            <h3 class="action-title">Refresh Info</h3>
            <p class="action-description">Reload database information and statistics from the server.</p>
            <app-button
              variant="ghost"
              [label]="'Refresh'"
              icon="\u{1F504}"
              (click)="loadDatabaseInfo()"
            />
          </div>
        </div>
      </section>

      <!-- Backups List -->
      @if (backups().length > 0) {
        <section class="backups-section">
          <div class="section-header">
            <h2 class="section-title">Available Backups</h2>
            <app-button
              variant="secondary"
              label="Refresh List"
              icon="\u{1F504}"
              (click)="listBackups()"
            />
          </div>
          <div class="backups-list">
            @for (backup of backups(); track backup.path) {
              <div class="backup-item">
                <div class="backup-info">
                  <div class="backup-path">{{ backup.path | basename }}</div>
                  <div class="backup-meta">
                    <span class="backup-size">{{ formatSize(backup.size) }}</span>
                    <span class="backup-date">{{ backup.modifiedFormatted }}</span>
                  </div>
                </div>
                <div class="backup-actions">
                  <app-button
                    variant="secondary"
                    label="Restore"
                    size="sm"
                    (click)="restoreBackup(backup)"
                  />
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- Persistence Notice -->
      <section class="notice-section">
        <div class="notice-card">
          <div class="notice-icon">\u2139\uFE0F</div>
          <div class="notice-content">
            <h4 class="notice-title">Data Persistence Information</h4>
            <div class="notice-body">
              <ul class="notice-list">
                <li>\u2713 Your data is stored persistently in SQLite database files</li>
                <li>\u2713 Data survives application restarts and system reboots</li>
                <li>\u2713 Sample data is only inserted when the database is first created</li>
                <li>\u2713 You must explicitly delete data through the UI</li>
                <li>\u2713 Regular backups are recommended for production use</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,styles:[`
    .db-management {
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

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .info-section {
      margin-bottom: 32px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .info-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .info-label {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 16px;
      color: #fff;
      font-weight: 600;
      word-break: break-all;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .integrity-section {
      margin-bottom: 32px;
    }

    .integrity-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
    }

    .integrity-card.valid {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .integrity-card.invalid {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .integrity-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .integrity-icon {
      font-size: 24px;
    }

    .integrity-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      flex: 1;
    }

    .integrity-body {
      color: #94a3b8;
      font-size: 14px;
    }

    .integrity-message {
      margin: 0 0 8px 0;
    }

    .integrity-date {
      margin: 0;
      font-size: 13px;
    }

    .actions-section {
      margin-bottom: 32px;
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .action-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .action-icon {
      font-size: 32px;
    }

    .action-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .action-description {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.6;
      flex: 1;
    }

    .backups-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }

    .backups-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .backup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 12px;
    }

    .backup-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .backup-path {
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      color: #fff;
    }

    .backup-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #94a3b8;
    }

    .notice-section {
      margin-bottom: 32px;
    }

    .notice-card {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-radius: 12px;
    }

    .notice-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .notice-content {
      flex: 1;
    }

    .notice-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 12px 0;
    }

    .notice-body {
      margin: 0;
    }

    .notice-list {
      margin: 0;
      padding-left: 20px;
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.8;
    }

    .notice-list li {
      margin-bottom: 4px;
    }

    @media (max-width: 1200px) {
      .info-grid,
      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-cards {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .db-management {
        padding: 16px;
      }

      .info-grid,
      .stats-section {
        grid-template-columns: 1fr;
      }

      .backup-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
  `]})],I);let B=class{transform(t){return t.split("/").pop()||t}};B=V([(0,n.nT_)({name:"basename",standalone:!0})],B);var _=a(1225),L=Object.defineProperty,R=Object.getOwnPropertyDescriptor,j=(t,e,a,i)=>{for(var r,s=i>1?void 0:i?R(e,a):e,o=t.length-1;o>=0;o--)(r=t[o])&&(s=(i?r(e,a,s):r(s))||s);return i&&s&&L(e,a,s),s};let N=class{constructor(){this.logger=(0,o.WQX)(d.g),this.http=(0,o.WQX)(i.Qq),this.api=(0,o.WQX)(p.G),this.docsService=(0,o.WQX)(g.F),this.activeView=(0,o.vPA)("INDEX"),this.isLoading=(0,o.vPA)(!1),this.isMobileView=(0,o.vPA)(!1),this.showContent=(0,o.vPA)(!1),this.users=(0,o.vPA)([]),this.products=(0,o.vPA)([]),this.orders=(0,o.vPA)([]),this.docsOpen=(0,o.vPA)(!0),this.demoOpen=(0,o.vPA)(!0),this.vegaOpen=(0,o.vPA)(!0),this.docCategories=(0,o.vPA)([]),this.demoItems=(0,o.vPA)([{id:"demo_sqlite_user",label:"SQLite Users",icon:"\uD83D\uDDC4️",active:!1},{id:"demo_duckdb_products",label:"DuckDB Products",icon:"\uD83E\uDD86",active:!1},{id:"demo_duckdb_analytics",label:"DuckDB Analytics",icon:"\uD83D\uDCCA",active:!1},{id:"demo_websocket",label:"WebSocket",icon:"\uD83D\uDD0C",active:!1},{id:"demo_chart",label:"Charts (SVG.js)",icon:"\uD83D\uDCC8",active:!1},{id:"demo_pdf",label:"PDF Viewer",icon:"\uD83D\uDCC4",active:!1},{id:"demo_maps",label:"Maps",icon:"\uD83D\uDDFA️",active:!1},{id:"demo_database",label:"Database Mgmt",icon:"\uD83D\uDDC3️",active:!1}]),this.vegaItems=(0,o.vPA)([{id:"vega_bar",label:"Bar Charts",icon:"\uD83D\uDCCA",active:!1},{id:"vega_line",label:"Line Charts",icon:"\uD83D\uDCC8",active:!1},{id:"vega_area",label:"Area Charts",icon:"\uD83C\uDF0A",active:!1},{id:"vega_scatter",label:"Scatter Plot",icon:"⚬",active:!1},{id:"vega_pie",label:"Pie/Donut",icon:"\uD83E\uDD67",active:!1}]),this.currentPageTitle=(0,o.vPA)("Documentation"),this.currentMarkdownPath=(0,o.vPA)("docs/INDEX.md"),this.markdownLoadError=(0,o.vPA)(null),this.stats=(0,o.vPA)({totalUsers:0,totalProducts:0,totalOrders:0,totalRevenue:0})}ngOnInit(){this.loadDocsCategories(),this.loadData(),this.checkMobileView(),window.addEventListener("resize",()=>this.checkMobileView())}loadDocsCategories(){try{let t=this.docsService.getDocsByCategory();this.docCategories.set(t),this.logger.info(`Loaded ${t.length} documentation categories`)}catch(t){this.logger.error("Failed to load documentation categories",t),this.docCategories.set([])}}checkMobileView(){this.isMobileView.set(window.innerWidth<=768),this.isMobileView()||this.showContent.set(!1)}goBackToMenu(){this.showContent.set(!1)}async loadData(){this.isLoading.set(!0);try{let[t,e,a]=await Promise.all([this.api.callOrThrow("getUsers").catch(()=>[]),this.api.callOrThrow("getProducts").catch(()=>[]),this.api.callOrThrow("getOrders").catch(()=>[])]);this.users.set(t),this.products.set(e),this.orders.set(a),this.stats.set({totalUsers:t.length,totalProducts:e.length,totalOrders:a.length,totalRevenue:a.reduce((t,e)=>t+(e.total||0),0)})}catch(t){this.logger.error("Failed to load data",t)}finally{this.isLoading.set(!1)}}setActiveView(t){this.activeView.set(t);let e=this.docItems().find(e=>e.id===t),a=this.demoItems().find(e=>e.id===t),i=e||a;this.currentPageTitle.set(i?i.label:t),t.startsWith("demo_")?this.currentMarkdownPath.set(""):this.currentMarkdownPath.set(`docs/${t}.md`),this.isMobileView()&&this.showContent.set(!0),this.contentArea&&(this.contentArea.nativeElement.scrollTop=0)}onNavClick(t){this.setActiveView(t)}toggleDocsSection(){this.docsOpen.update(t=>!t)}toggleDemoSection(){this.demoOpen.update(t=>!t)}toggleVegaSection(){this.vegaOpen.update(t=>!t)}onMarkdownLoad(t){this.markdownLoadError.set(null),this.logger.info("Markdown loaded successfully:",this.currentMarkdownPath())}onMarkdownError(t){this.markdownLoadError.set(`Failed to load documentation: ${this.currentMarkdownPath()}`),this.logger.error("Failed to load markdown",t,this.currentMarkdownPath())}loadCurrentMarkdown(){let t=this.currentMarkdownPath();this.currentMarkdownPath.set(""),setTimeout(()=>{this.currentMarkdownPath.set(t),this.markdownLoadError.set(null)},100)}onStatsUpdate(t){this.stats.update(e=>({...e,[t.type]:t.count})),this.loadData()}};j([(0,c.ViewChild)("contentArea")],N.prototype,"contentArea",2),N=j([(0,n.uAl)({selector:"app-dashboard",standalone:!0,imports:[l.MD,s.y2,u.m,w,k,D.E,F,A.v,T.o,I,_.F],template:`
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
            @for (category of docCategories(); track category.label) {
              <div class="category-section">
                <div class="category-header">
                  <span class="category-icon">{{ category.icon }}</span>
                  <span class="category-title">{{ category.label }}</span>
                  <span class="category-count">({{ category.items.length }})</span>
                </div>
                <div class="pill-container">
                  @for (item of category.items; track item.id) {
                    <button
                      class="dot-pill"
                      [class.active]="activeView() === item.id"
                      (click)="onNavClick(item.id)"
                      [attr.title]="item.description || item.label"
                    >
                      <span class="pill-dot"></span>
                      <span class="pill-text">{{ item.label }}</span>
                    </button>
                  }
                </div>
              </div>
            }
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

        <!-- Vega Charts Section -->
        <div class="pill-section">
          <button class="section-header" (click)="toggleVegaSection()">
            <span class="section-title">Vega Charts</span>
            <span class="section-toggle">{{ vegaOpen() ? '\u25BC' : '\u25B6' }}</span>
          </button>
          @if (vegaOpen()) {
            <div class="pill-container">
              @for (item of vegaItems(); track item.id) {
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
          @if (activeView() === 'demo_sqlite_user') {
            <app-sqlite-user-demo></app-sqlite-user-demo>
          } @else if (activeView() === 'demo_duckdb_products') {
            <app-duckdb-products-demo></app-duckdb-products-demo>
          } @else if (activeView() === 'demo_duckdb_analytics') {
            <app-duckdb-analytics-demo></app-duckdb-analytics-demo>
          } @else if (activeView() === 'demo_websocket') {
            <app-websocket-demo></app-websocket-demo>
          } @else if (activeView() === 'demo_chart') {
            <app-charts-demo></app-charts-demo>
          } @else if (activeView() === 'demo_pdf') {
            <app-pdf-viewer-demo></app-pdf-viewer-demo>
          } @else if (activeView() === 'demo_maps') {
            <app-maps-demo></app-maps-demo>
          } @else if (activeView() === 'demo_database') {
            <app-database-management></app-database-management>
          } @else if (activeView() === 'vega_bar') {
            <app-vega-charts-demo></app-vega-charts-demo>
          } @else if (activeView() === 'vega_line') {
            <app-vega-charts-demo></app-vega-charts-demo>
          } @else if (activeView() === 'vega_area') {
            <app-vega-charts-demo></app-vega-charts-demo>
          } @else if (activeView() === 'vega_scatter') {
            <app-vega-charts-demo></app-vega-charts-demo>
          } @else if (activeView() === 'vega_pie') {
            <app-vega-charts-demo></app-vega-charts-demo>
          } @else if (markdownLoadError()) {
            <div class="error-state">
              <span class="error-icon">\u26A0\uFE0F</span>
              <h3 class="error-title">Documentation Not Found</h3>
              <p class="error-message">{{ markdownLoadError() }}</p>
              <p class="error-hint">The documentation file may not have been copied during build.</p>
              <button class="btn-retry" (click)="loadCurrentMarkdown()">
                <span>\u{1F504}</span> Retry Loading
              </button>
            </div>
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

    .category-section {
      margin-bottom: 12px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: rgba(30, 41, 59, 0.3);
      border-radius: 6px;
    }

    .category-icon {
      font-size: 16px;
    }

    .category-title {
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex: 1;
    }

    .category-count {
      font-size: 11px;
      color: #94a3b8;
      background: rgba(148, 163, 184, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
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

    /* Error State Styles */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      color: #94a3b8;
    }

    .error-icon {
      font-size: 64px;
      margin-bottom: 24px;
      opacity: 0.8;
    }

    .error-title {
      font-size: 24px;
      font-weight: 600;
      color: #fff;
      margin: 0 0 16px;
    }

    .error-message {
      font-size: 16px;
      color: #ef4444;
      margin: 0 0 12px;
      font-family: 'Fira Code', monospace;
    }

    .error-hint {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 24px;
      max-width: 400px;
    }

    .btn-retry {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-retry:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.4);
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
  `]})],N);let Q=class{constructor(){this.logger=(0,o.WQX)(d.g)}ngOnInit(){this.logger.info("Angular Rspack Application Initialized")}};Q=((t,e)=>{for(var a,i=e,r=t.length-1;r>=0;r--)(a=t[r])&&(i=a(i)||i);return i})([(0,n.uAl)({selector:"app-root",standalone:!0,imports:[N],template:`
    <app-dashboard />
  `,styles:[`
    :host {
      display: block;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }
  `]})],Q);let X=console,G=window,U=new class{constructor(){this.subscribers=new Map}init(t,e){}publish(t,e){for(let a of this.subscribers.get(t)||new Set)a(e)}subscribe(t,e){this.subscribers.has(t)||this.subscribers.set(t,new Set),this.subscribers.get(t).add(e)}};U.init("app",300),G.__FRONTEND_EVENT_BUS__=U,X.info("Starting Angular bootstrap");try{(0,r.B8)(Q,{providers:[(0,i.$R)(),(0,s.Xu)()]}).then(t=>{X.info("Angular bootstrap completed successfully"),window.addEventListener("error",t=>{t.preventDefault();let e=t.error??t.message??"Unknown error";X.error("Global error:",e)}),window.addEventListener("unhandledrejection",t=>{t.preventDefault();let e=t.reason??"Unknown rejection";X.error("Unhandled promise rejection:",e)}),U.publish("app:ready",{timestamp:Date.now()})}).catch(t=>{let e=t instanceof Error?t.message:String(t);X.error("Angular bootstrap failed:",e)})}catch(e){let t=e instanceof Error?e.message:String(e);X.error("Bootstrap threw synchronously:",t)}}}]);
//# sourceMappingURL=main~1.cc9cf2702bdde17e.js.map