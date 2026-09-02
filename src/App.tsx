import { useState } from "react";
import { db, type Product } from "./db/database";
import { useProducts } from "./db/hooks";

type Page = "dashboard" | "products" | "documents" | "claims";

function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const products = useProducts();
  const productCount = products?.length ?? 0;
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    purchaseDate: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddProduct = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  const product: Product = {
    name: formData.name.trim(),
    brand: formData.brand.trim(),
    model: formData.model.trim(),
    purchaseDate: formData.purchaseDate,
    createdAt: new Date().toISOString(),
  };

  await db.products.add(product);

  setFormData({
    name: "",
    brand: "",
    model: "",
    purchaseDate: "",
  });

  setIsAddProductOpen(false);
  setActivePage("products");
};

  const openAddProductModal = () => {
    setIsAddProductOpen(true);
  };

  const closeAddProductModal = () => {
    setIsAddProductOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "products":
        return (
          <section className="page-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Products</p>
                <h3>Your products</h3>
              </div>

              <button
                className="primary-button"
                onClick={openAddProductModal}
              >
                Add Product
              </button>
            </div>

            {productCount === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">+</div>

                <h4>No products yet</h4>

                <p>
                  Add your first product to start tracking its warranty,
                  documents, and service history.
                </p>

                <button
                  className="primary-button"
                  onClick={openAddProductModal}
                >
                  Add your first product
                </button>
              </div>
            ) : (
              <div className="product-list">
                {products?.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div>
                      <p className="product-brand">{product.brand}</p>
                      <h4>{product.name}</h4>
                      <p className="product-model">
                        Model: {product.model || "Not provided"}
                      </p>
                    </div>

                    <div className="product-date">
                      <span>Purchased</span>
                      <strong>
                        {product.purchaseDate || "Not provided"}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );

      case "documents":
        return (
          <section className="page-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Documents</p>
                <h3>Your documents</h3>
              </div>
            </div>

            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h4>No documents yet</h4>
              <p>
                Receipts, warranty cards, manuals, and service documents will
                appear here.
              </p>
            </div>
          </section>
        );

      case "claims":
        return (
          <section className="page-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Claims</p>
                <h3>Warranty claims</h3>
              </div>
            </div>

            <div className="empty-state">
              <div className="empty-icon">+</div>
              <h4>No claims yet</h4>
              <p>
                Warranty claims and their progress will appear here.
              </p>
            </div>
          </section>
        );

      case "dashboard":
      default:
        return (
          <>
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
                  <strong>{productCount}</strong>
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
                  <h3>Recent products</h3>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setActivePage("products")}
                >
                  View all
                </button>
              </div>

              {productCount === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">+</div>

                  <h4>No products yet</h4>

                  <p>
                    Add your first product to start tracking its warranty,
                    documents, and service history.
                  </p>

                  <button
                    className="primary-button"
                    onClick={openAddProductModal}
                  >
                    Add your first product
                  </button>
                </div>
              ) : (
                <div className="product-list">
                  {products?.slice(0, 3).map((product) => (
                    <article className="product-card" key={product.id}>
                      <div>
                        <p className="product-brand">{product.brand}</p>
                        <h4>{product.name}</h4>
                        <p className="product-model">
                          Model: {product.model || "Not provided"}
                        </p>
                      </div>

                      <div className="product-date">
                        <span>Purchased</span>
                        <strong>
                          {product.purchaseDate || "Not provided"}
                        </strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        );
    }
  };

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
          <button
            className={`nav-item ${
              activePage === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${
              activePage === "products" ? "active" : ""
            }`}
            onClick={() => setActivePage("products")}
          >
            Products
          </button>

          <button
            className={`nav-item ${
              activePage === "documents" ? "active" : ""
            }`}
            onClick={() => setActivePage("documents")}
          >
            Documents
          </button>

          <button
            className={`nav-item ${
              activePage === "claims" ? "active" : ""
            }`}
            onClick={() => setActivePage("claims")}
          >
            Claims
          </button>
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
            <p className="eyebrow">
              {activePage === "dashboard"
                ? "Dashboard"
                : activePage === "products"
                ? "Products"
                : activePage === "documents"
                ? "Documents"
                : "Claims"}
            </p>

            <h2>
              {activePage === "dashboard"
                ? "Welcome to Warranty Tracker"
                : activePage === "products"
                ? "Your products"
                : activePage === "documents"
                ? "Your documents"
                : "Your warranty claims"}
            </h2>
          </div>

          <button
            className="primary-button"
            onClick={openAddProductModal}
          >
            Add Product
          </button>
        </header>

        {renderPage()}
      </main>

      {isAddProductOpen && (
        <div className="modal-backdrop" onClick={closeAddProductModal}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">New product</p>
                <h3>Add a product</h3>
              </div>

              <button
                className="close-button"
                onClick={closeAddProductModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label htmlFor="name">Product name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. MacBook Air"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="e.g. Apple"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="e.g. A3113"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchaseDate">Purchase date</label>
                <input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddProductModal}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;