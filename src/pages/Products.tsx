import { useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  db,
  type Product,
} from "../db/database";

import { useProducts } from "../db/hooks";

import AddWarrantyModal from "../components/AddWarrantyModal";
import ReceiptAnalysisModal from "../components/ReceiptAnalysisModal";

function Products() {
  const products = useProducts();

  const [isProductModalOpen, setIsProductModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [warrantyProductId, setWarrantyProductId] =
    useState<number | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    purchaseDate: "",
  });

  const productCount =
    products?.length ?? 0;

  /* --------------------------------
     Product form
  -------------------------------- */

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

    const now =
      new Date().toISOString();

    await db.products.add({
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      purchaseDate:
        formData.purchaseDate,
      createdAt: now,
      updatedAt: now,
    });

    closeProductModal();
  };

  const openEditProduct = (
    product: Product
  ) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      brand: product.brand,
      model: product.model,
      purchaseDate:
        product.purchaseDate,
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

    await db.products.update(
      editingProduct.id,
      {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        purchaseDate:
          formData.purchaseDate,
        updatedAt:
          new Date().toISOString(),
      }
    );

    closeProductModal();
  };

  const handleDeleteProduct = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    await db.products.delete(id);
  };

  /* --------------------------------
     Warranty modal
  -------------------------------- */

  const openWarrantyModal = (
    productId: number
  ) => {
    setWarrantyProductId(productId);
  };

  const closeWarrantyModal = () => {
    setWarrantyProductId(null);
  };

  /* --------------------------------
     Receipt analysis
  -------------------------------- */

  const openReceiptModal = () => {
    setIsReceiptModalOpen(true);
  };

  const closeReceiptModal = () => {
    setIsReceiptModalOpen(false);
  };

  const handleReceiptImport = async (
    file: File,
    productData: {
      name: string;
      brand: string;
      model: string;
      purchaseDate: string;
      purchasePrice: number;
      currency: string;
      seller: string;
    },
    warrantyData: {
      provider: string;
      type:
        | "manufacturer"
        | "seller"
        | "extended"
        | "other";
      durationMonths: number;
      startDate: string;
    }
  ) => {
    const now =
      new Date().toISOString();

    const warrantyEndDate =
      new Date(
        warrantyData.startDate
      );

    warrantyEndDate.setMonth(
      warrantyEndDate.getMonth() +
        warrantyData.durationMonths
    );

    const endDate =
      warrantyEndDate
        .toISOString()
        .split("T")[0];

    await db.transaction(
      "rw",
      db.products,
      db.warranties,
      db.documents,
      async () => {
        const productId =
          await db.products.add({
            name:
              productData.name,
            brand:
              productData.brand,
            model:
              productData.model,
            purchaseDate:
              productData.purchaseDate,
            purchasePrice:
              productData.purchasePrice,
            currency:
              productData.currency,
            seller:
              productData.seller,
            createdAt: now,
            updatedAt: now,
          });

        await db.warranties.add({
          productId,
          provider:
            warrantyData.provider,
          type:
            warrantyData.type,
          startDate:
            warrantyData.startDate,
          durationMonths:
            warrantyData.durationMonths,
          endDate,
          coverage: "",
          exclusions: "",
          createdAt: now,
          updatedAt: now,
        });

        await db.documents.add({
          productId,
          name: file.name,
          type: "receipt",
          mimeType: file.type,
          size: file.size,
          file,
          createdAt: now,
        });
      }
    );

    closeReceiptModal();
  };

  /* --------------------------------
     Product card
  -------------------------------- */

  const renderProductCard = (
    product: Product
  ) => {
    return (
      <article
        className="product-card"
        key={product.id}
      >
        <a
          href={`/products/${product.id}`}
          className="product-information"
        >
          <p className="product-brand">
            {product.brand ||
              "Unknown brand"}
          </p>

          <h4>
            {product.name}
          </h4>

          <p className="product-model">
            Model:{" "}
            {product.model ||
              "Not provided"}
          </p>
        </a>

        <div className="product-date">
          <span>
            Purchased
          </span>

          <strong>
            {product.purchaseDate ||
              "Not provided"}
          </strong>
        </div>

        <div className="product-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              openWarrantyModal(
                product.id!
              )
            }
          >
            Add Warranty
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              openEditProduct(
                product
              )
            }
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() =>
              handleDeleteProduct(
                product.id!
              )
            }
          >
            Delete
          </button>
        </div>
      </article>
    );
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Products
          </p>

          <h3>
            Your products
          </h3>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={
              openReceiptModal
            }
          >
            Import Receipt
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={
              openAddProductModal
            }
          >
            Add Product
          </button>
        </div>
      </div>

      {productCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            +
          </div>

          <h4>
            No products yet
          </h4>

          <p>
            Add your first product to
            start tracking its warranty,
            documents, and service
            history.
          </p>

          <div className="page-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={
                openReceiptModal
              }
            >
              Import Receipt
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={
                openAddProductModal
              }
            >
              Add your first product
            </button>
          </div>
        </div>
      ) : (
        <div className="product-list">
          {products?.map(
            renderProductCard
          )}
        </div>
      )}

      {isProductModalOpen && (
        <div
          className="modal-backdrop"
          onClick={
            closeProductModal
          }
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
                type="button"
                className="close-button"
                onClick={
                  closeProductModal
                }
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
                  value={
                    formData.name
                  }
                  onChange={
                    handleInputChange
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="brand">
                  Brand
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  placeholder="e.g. Apple"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleInputChange
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">
                  Model
                </label>

                <input
                  id="model"
                  name="model"
                  type="text"
                  placeholder="e.g. A3113"
                  value={
                    formData.model
                  }
                  onChange={
                    handleInputChange
                  }
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
                  value={
                    formData.purchaseDate
                  }
                  onChange={
                    handleInputChange
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeProductModal
                  }
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
          productId={
            warrantyProductId
          }
          onClose={
            closeWarrantyModal
          }
        />
      )}

      {isReceiptModalOpen && (
        <ReceiptAnalysisModal
          onClose={
            closeReceiptModal
          }
          onComplete={
            handleReceiptImport
          }
        />
      )}
    </section>
  );
}

export default Products;