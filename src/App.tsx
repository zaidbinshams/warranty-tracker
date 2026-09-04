import { NavLink, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Documents from "./pages/Documents";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            WT
          </div>

          <div>
            <h1>Warranty Tracker</h1>
            <p>Your products, protected.</p>
          </div>
        </div>

        <nav className="navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Products
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Documents
          </NavLink>

          <NavLink
            to="/claims"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Claims
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span>Private by default</span>
            <p>Your data stays on this device.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:productId"
            element={<ProductDetails />}
          />

          <Route
  path="/documents"
  element={<Documents />}
/>

          <Route
            path="/claims"
            element={
              <div className="page-section">
                <h1>Claims</h1>
                <p>
                  Your warranty claims will appear here.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;