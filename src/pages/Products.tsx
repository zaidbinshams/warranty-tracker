import { useState } from "react";
import { Link } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";

import { db, type Product } from "../db/database";
import { useProducts } from "../db/hooks";
import AddWarrantyModal from "../components/AddWarrantyModal";

function Products() {
  const products = useProducts();

  const [isProductModalOpen, setIsProductModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [warrantyProductId, setWarrantyProductId] =
    useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    purchaseDate: "",
  });

  const productCount = products?.length ?? 0;

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      model: "",
      purchaseDate: "",
    });
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    resetForm();
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleAddProduct = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const now = new Date().toISOString();

    await db.products.add({
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      purchaseDate: formData.purchaseDate,
      createdAt: now,
      updatedAt: now,
    });

    closeProductModal();
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      brand: product.brand,
      model: product.model,
      purchaseDate: product.purchaseDate,
    });

    setIsProductModalOpen(true);
  };

  const handleEditProduct = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingProduct?.id) {
      return;
    }

    await db.products.update(editingProduct.id, {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      purchaseDate: formData.purchaseDate,
      updatedAt: new Date().toISOString(),
    });

    closeProductModal();
  };

  const handleDeleteProduct = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    await db.products.delete(id);
  };

  const openWarrantyModal = (productId: number) => {
    setWarrantyProductId(productId);
  };

  const closeWarrantyModal = () => {
    setWarrantyProductId(null);
  };

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
            Add your first product to start tracking its
            warranty, documents, and service history.
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
            <article
              className="product-card"
              key={product.id}
            >
              <Link
                to={`/products/${product.id}`}
                className="product-information"
              >
                <p className="product-brand">
                  {product.brand || "Unknown brand"}
                </p>

                <h4>{product.name}</h4>

                <p className="product-model">
                  Model:{" "}
                  {product.model || "Not provided"}
                </p>
              </Link>

              <div className="product-date">
                <span>Purchased</span>

                <strong>
                  {product.purchaseDate ||
                    "Not provided"}
                </strong>
              </div>

              <div className="product-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    openWarrantyModal(product.id!)
                  }
                >
                  Add Warranty
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    openEditProduct(product)
                  }
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDeleteProduct(product.id!)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isProductModalOpen && (
        <div
          className="modal-backdrop"
          onClick={closeProductModal}
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingProduct
                    ? "Edit product"
                    : "New product"}
                </p>

                <h3>
                  {editingProduct
                    ? "Edit product"
                    : "Add a product"}
                </h3>
              </div>

              <button
                className="close-button"
                onClick={closeProductModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                editingProduct
                  ? handleEditProduct
                  : handleAddProduct
              }
            >
              <div className="form-group">
                <label htmlFor="name">
                  Product name
                </label>

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
                <label htmlFor="purchaseDate">
                  Purchase date
                </label>

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
                  onClick={closeProductModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingProduct
                    ? "Save Changes"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {warrantyProductId !== null && (
        <AddWarrantyModal
          productId={warrantyProductId}
          onClose={closeWarrantyModal}
        />
      )}
    </section>
  );
}

export default Products;