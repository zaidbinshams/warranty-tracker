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
import { addMonths } from "../utils/date";

function Products() {
  const products = useProducts();

  const [
    isProductModalOpen,
    setIsProductModalOpen,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null);

  const [
    warrantyProductId,
    setWarrantyProductId,
  ] = useState<number | null>(null);

  const [
    isReceiptModalOpen,
    setIsReceiptModalOpen,
  ] = useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      brand: "",
      model: "",
      purchaseDate: "",
      purchasePrice: "",
      currency: "INR",
      seller: "",
    });

  const productCount =
    products?.length ?? 0;

  /* --------------------------------
     Product form
  -------------------------------- */

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } =
      event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCurrencyChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData((current) => ({
      ...current,
      currency:
        event.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      model: "",
      purchaseDate: "",
      purchasePrice: "",
      currency: "INR",
      seller: "",
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

    const purchasePrice =
      formData.purchasePrice.trim() !== ""
        ? Number(
            formData.purchasePrice
          )
        : undefined;

    await db.products.add({
      name:
        formData.name.trim(),

      brand:
        formData.brand.trim(),

      model:
        formData.model.trim(),

      purchaseDate:
        formData.purchaseDate,

      purchasePrice,

      currency:
        purchasePrice !== undefined
          ? formData.currency
          : undefined,

      seller:
        formData.seller.trim() ||
        undefined,

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
      purchasePrice:
        product.purchasePrice !==
        undefined
          ? String(
              product.purchasePrice
            )
          : "",
      currency:
        product.currency ?? "INR",
      seller:
        product.seller ?? "",
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

    const purchasePrice =
      formData.purchasePrice.trim() !== ""
        ? Number(
            formData.purchasePrice
          )
        : undefined;

    await db.products.update(
      editingProduct.id,
      {
        name:
          formData.name.trim(),

        brand:
          formData.brand.trim(),

        model:
          formData.model.trim(),

        purchaseDate:
          formData.purchaseDate,

        purchasePrice,

        currency:
          purchasePrice !== undefined
            ? formData.currency
            : undefined,

        seller:
          formData.seller.trim() ||
          undefined,

        updatedAt:
          new Date().toISOString(),
      }
    );

    closeProductModal();
  };

  const handleDeleteProduct =
    async (id: number) => {
      const product =
        await db.products.get(id);

      if (!product) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${product.name}" and all of its warranties and documents? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        await db.transaction(
          "rw",
          db.products,
          db.warranties,
          db.documents,
          async () => {
            await db.warranties
              .where("productId")
              .equals(id)
              .delete();

            await db.documents
              .where("productId")
              .equals(id)
              .delete();

            await db.products.delete(
              id
            );
          }
        );
      } catch (error) {
        console.error(
          "Failed to delete product:",
          error
        );

        window.alert(
          "The product could not be deleted. Please try again."
        );
      }
    };

  /* --------------------------------
     Warranty modal
  -------------------------------- */

  const openWarrantyModal = (
    productId: number
  ) => {
    setWarrantyProductId(
      productId
    );
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

  const handleReceiptImport =
    async (
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
        found: boolean;
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

          if (
            warrantyData.found &&
            warrantyData.startDate &&
            warrantyData.durationMonths >
              0
          ) {
            const endDate = addMonths(
  warrantyData.startDate,
  warrantyData.durationMonths
);

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
          }

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

          {product.purchasePrice !==
            undefined && (
            <strong>
              {product.currency ===
              "INR"
                ? "₹"
                : `${product.currency ?? ""} `}
              {product.purchasePrice.toLocaleString(
                "en-IN"
              )}
            </strong>
          )}
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

      {/* Product modal */}

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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="purchasePrice">
                    Purchase price
                  </label>

                  <input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 74999"
                    value={
                      formData.purchasePrice
                    }
                    onChange={
                      handleInputChange
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">
                    Currency
                  </label>

                  <select
                    id="currency"
                    name="currency"
                    value={
                      formData.currency
                    }
                    onChange={
                      handleCurrencyChange
                    }
                  >
                    <option value="INR">
                      INR
                    </option>

                    <option value="USD">
                      USD
                    </option>

                    <option value="EUR">
                      EUR
                    </option>

                    <option value="GBP">
                      GBP
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="seller">
                  Seller
                </label>

                <input
                  id="seller"
                  name="seller"
                  type="text"
                  placeholder="e.g. Amazon"
                  value={
                    formData.seller
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

      {/* Warranty modal */}

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

      {/* Receipt analysis modal */}

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