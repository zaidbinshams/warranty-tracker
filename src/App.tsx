function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">WT</div>

          <div>
            <h1>Warranty Tracker</h1>
            <p>Your products, protected.</p>
          </div>
        </div>

        <nav className="navigation">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Products</button>
          <button className="nav-item">Documents</button>
          <button className="nav-item">Claims</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span>Private by default</span>
            <p>Your data stays on this device.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Welcome to Warranty Tracker</h2>
          </div>

          <button className="primary-button">Add Product</button>
        </header>

        <section className="overview">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Overview</p>
              <h3>Your warranty status</h3>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card green-card">
              <p>Products</p>
              <strong>0</strong>
              <span>Tracked products</span>
            </div>

            <div className="stat-card blue-card">
              <p>Active Warranties</p>
              <strong>0</strong>
              <span>Currently covered</span>
            </div>

            <div className="stat-card light-card">
              <p>Expiring Soon</p>
              <strong>0</strong>
              <span>Within 30 days</span>
            </div>

            <div className="stat-card dark-card">
              <p>Expired</p>
              <strong>0</strong>
              <span>Needs attention</span>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Products</p>
              <h3>Your products</h3>
            </div>

            <button className="secondary-button">View all</button>
          </div>

          <div className="empty-state">
            <div className="empty-icon">+</div>

            <h4>No products yet</h4>

            <p>
              Add your first product to start tracking its warranty,
              documents, and service history.
            </p>

            <button className="primary-button">Add your first product</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;