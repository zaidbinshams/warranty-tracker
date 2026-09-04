import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import {
  db,
  type Product,
  type Warranty,
} from "../db/database";

import { useProductWarranties } from "../db/hooks";

import {
  getDaysRemaining,
  getWarrantyStatus,
} from "../utils/warranty";

import AddWarrantyModal from "../components/AddWarrantyModal";

function ProductDetails() {
  const { productId } = useParams();

  const id = Number(productId);

  const [editingWarranty, setEditingWarranty] =
    useState<Warranty | null>(null);

  const [isWarrantyModalOpen, setIsWarrantyModalOpen] =
    useState(false);

  const product = useLiveQuery<Product | undefined>(
    () => {
      if (!Number.isInteger(id)) {
        return undefined;
      }

      return db.products.get(id);
    },
    [id]
  );

  const warranties = useProductWarranties(id);

  const openAddWarranty = () => {
    setEditingWarranty(null);
    setIsWarrantyModalOpen(true);
  };

  const openEditWarranty = (warranty: Warranty) => {
    setEditingWarranty(warranty);
    setIsWarrantyModalOpen(true);
  };

  const closeWarrantyModal = () => {
    setEditingWarranty(null);
    setIsWarrantyModalOpen(false);
  };

  const handleDeleteWarranty = async (
    warrantyId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this warranty?"
    );

    if (!confirmed) {
      return;
    }

    await db.warranties.delete(warrantyId);
  };

  if (!Number.isInteger(id)) {
    return (
      <section className="page-section">
        <h2>Invalid product</h2>

        <Link to="/products">
          Back to products
        </Link>
      </section>
    );
  }

  if (product === undefined) {
    return (
      <section className="page-section">
        <Link
          to="/products"
          className="back-link"
        >
          ← Back to Products
        </Link>

        <div className="empty-state">
          <h4>Product not found</h4>

          <p>
            This product may have been deleted or
            doesn't exist.
          </p>

          <Link
            to="/products"
            className="primary-button link-button"
          >
            Back to Products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <Link
        to="/products"
        className="back-link"
      >
        ← Back to Products
      </Link>

      {/* Product header */}

      <div className="product-detail-header">
        <div>
          <p className="eyebrow">
            {product.brand || "Unknown brand"}
          </p>

          <h2>{product.name}</h2>

          <p className="detail-model">
            Model: {product.model || "Not provided"}
          </p>
        </div>
      </div>

      {/* Product overview */}

      <div className="detail-grid">
        <div className="detail-card">
          <p className="detail-label">
            Purchase date
          </p>

          <strong>
            {product.purchaseDate ||
              "Not provided"}
          </strong>
        </div>

        <div className="detail-card">
          <p className="detail-label">
            Warranties
          </p>

          <strong>
            {warranties?.length ?? 0}
          </strong>
        </div>
      </div>

      {/* Warranties */}

      <section className="warranties-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Coverage</p>
            <h3>Warranties</h3>
          </div>

          <button
            className="primary-button"
            onClick={openAddWarranty}
          >
            Add Warranty
          </button>
        </div>

        {warranties?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">+</div>

            <h4>No warranties added</h4>

            <p>
              Add this product's warranty to start
              tracking its coverage.
            </p>

            <button
              className="primary-button"
              onClick={openAddWarranty}
            >
              Add Warranty
            </button>
          </div>
        ) : (
          <div className="warranty-list">
            {warranties?.map((warranty) => {
              const status = getWarrantyStatus(
                warranty.endDate
              );

              const daysRemaining =
                getDaysRemaining(
                  warranty.endDate
                );

              return (
                <article
                  className="warranty-card"
                  key={warranty.id}
                >
                  <div className="warranty-header">
                    <div>
                      <p className="product-brand">
                        {warranty.type}
                      </p>

                      <h4>
                        {warranty.provider}
                      </h4>
                    </div>

                    <span
                      className={`warranty-status ${status}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="warranty-dates">
                    <div>
                      <span>Start</span>

                      <strong>
                        {warranty.startDate}
                      </strong>
                    </div>

                    <div>
                      <span>End</span>

                      <strong>
                        {warranty.endDate}
                      </strong>
                    </div>

                    <div>
                      <span>Remaining</span>

                      <strong>
                        {daysRemaining > 0
                          ? `${daysRemaining} days`
                          : "Expired"}
                      </strong>
                    </div>
                  </div>

                  {warranty.coverage && (
                    <div className="warranty-description">
                      <p className="detail-label">
                        Coverage
                      </p>

                      <p>
                        {warranty.coverage}
                      </p>
                    </div>
                  )}

                  {warranty.exclusions && (
                    <div className="warranty-description">
                      <p className="detail-label">
                        Exclusions
                      </p>

                      <p>
                        {warranty.exclusions}
                      </p>
                    </div>
                  )}

                  {/* Warranty actions */}

                  <div className="warranty-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        openEditWarranty(warranty)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteWarranty(
                          warranty.id!
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Warranty modal */}

      {isWarrantyModalOpen && (
        <AddWarrantyModal
          productId={id}
          warranty={
            editingWarranty ?? undefined
          }
          onClose={closeWarrantyModal}
        />
      )}
    </section>
  );
}

export default ProductDetails;