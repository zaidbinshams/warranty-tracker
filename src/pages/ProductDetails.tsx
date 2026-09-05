import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import {
  db,
  type Product,
  type Warranty,
} from "../db/database";

import {
  useProductDocuments,
  useProductWarranties,
} from "../db/hooks";

import {
  getDaysRemaining,
  getWarrantyStatus,
} from "../utils/warranty";

import AddWarrantyModal from "../components/AddWarrantyModal";
import AddDocumentModal from "../components/AddDocumentModal";

function ProductDetails() {
  const { productId } = useParams();

  const id = Number(productId);

  const [editingWarranty, setEditingWarranty] =
    useState<Warranty | null>(null);

  const [isWarrantyModalOpen, setIsWarrantyModalOpen] =
    useState(false);

  const [isDocumentModalOpen, setIsDocumentModalOpen] =
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

  const warranties =
    useProductWarranties(id);

  const documents =
    useProductDocuments(id);

  const openAddWarranty = () => {
    setEditingWarranty(null);
    setIsWarrantyModalOpen(true);
  };

  const openEditWarranty = (
    warranty: Warranty
  ) => {
    setEditingWarranty(warranty);
    setIsWarrantyModalOpen(true);
  };

  const closeWarrantyModal = () => {
    setEditingWarranty(null);
    setIsWarrantyModalOpen(false);
  };

  const openDocumentModal = () => {
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
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

    await db.warranties.delete(
      warrantyId
    );
  };

  const handleDeleteDocument = async (
    documentId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    await db.documents.delete(
      documentId
    );
  };

  const openDocument = (document: {
    file: Blob;
  }) => {
    const url = URL.createObjectURL(
      document.file
    );

    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  };

  const formatDate = (
    dateString: string
  ) => {
    if (!dateString) {
      return "Not provided";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  };

  const formatPrice = (
    price: number,
    currency: string
  ) => {
    if (currency === "INR") {
      return `₹${price.toLocaleString(
        "en-IN"
      )}`;
    }

    return `${currency} ${price.toLocaleString(
      "en-IN"
    )}`;
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
          <h4>
            Product not found
          </h4>

          <p>
            This product may have been
            deleted or doesn't exist.
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
            {product.brand ||
              "Unknown brand"}
          </p>

          <h2>{product.name}</h2>

          <p className="detail-model">
            Model:{" "}
            {product.model ||
              "Not provided"}
          </p>
        </div>
      </div>

      {/* Product information */}

      <div className="detail-grid">
        <div className="detail-card">
          <p className="detail-label">
            Purchase date
          </p>

          <strong>
            {formatDate(
              product.purchaseDate
            )}
          </strong>
        </div>

        <div className="detail-card">
          <p className="detail-label">
            Purchase price
          </p>

          <strong>
            {product.purchasePrice !==
            undefined
              ? formatPrice(
                  product.purchasePrice,
                  product.currency ??
                    "INR"
                )
              : "Not provided"}
          </strong>
        </div>

        <div className="detail-card">
          <p className="detail-label">
            Seller
          </p>

          <strong>
            {product.seller ||
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
            <p className="eyebrow">
              Coverage
            </p>

            <h3>Warranties</h3>
          </div>

          <button
            className="primary-button"
            onClick={
              openAddWarranty
            }
          >
            Add Warranty
          </button>
        </div>

        {warranties?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              +
            </div>

            <h4>
              No warranties added
            </h4>

            <p>
              Add this product's warranty
              to start tracking its
              coverage.
            </p>

            <button
              className="primary-button"
              onClick={
                openAddWarranty
              }
            >
              Add Warranty
            </button>
          </div>
        ) : (
          <div className="warranty-list">
            {warranties?.map(
              (warranty) => {
                const status =
                  getWarrantyStatus(
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
                          {
                            warranty.provider
                          }
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
                        <span>
                          Start
                        </span>

                        <strong>
                          {formatDate(
                            warranty.startDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          End
                        </span>

                        <strong>
                          {formatDate(
                            warranty.endDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Remaining
                        </span>

                        <strong>
                          {daysRemaining >
                          0
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
                          {
                            warranty.coverage
                          }
                        </p>
                      </div>
                    )}

                    {warranty.exclusions && (
                      <div className="warranty-description">
                        <p className="detail-label">
                          Exclusions
                        </p>

                        <p>
                          {
                            warranty.exclusions
                          }
                        </p>
                      </div>
                    )}

                    <div className="warranty-actions">
                      <button
                        className="secondary-button"
                        onClick={() =>
                          openEditWarranty(
                            warranty
                          )
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
              }
            )}
          </div>
        )}
      </section>

      {/* Documents */}

      <section className="documents-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              Files
            </p>

            <h3>Documents</h3>
          </div>

          <button
            className="primary-button"
            onClick={
              openDocumentModal
            }
          >
            Add Document
          </button>
        </div>

        {documents?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              +
            </div>

            <h4>
              No documents added
            </h4>

            <p>
              Upload receipts, warranty
              cards, manuals, or service
              documents for this product.
            </p>

            <button
              className="primary-button"
              onClick={
                openDocumentModal
              }
            >
              Add Document
            </button>
          </div>
        ) : (
          <div className="document-list">
            {documents?.map(
              (document) => (
                <article
                  className="document-card"
                  key={document.id}
                >
                  <div className="document-information">
                    <p className="product-brand">
                      {document.type}
                    </p>

                    <h4>
                      {document.name}
                    </h4>

                    <p className="document-meta">
                      {(
                        document.size /
                        1024
                      ).toFixed(1)}{" "}
                      KB
                    </p>
                  </div>

                  <div className="document-actions">
                    <button
                      className="secondary-button"
                      onClick={() =>
                        openDocument(
                          document
                        )
                      }
                    >
                      Open
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDeleteDocument(
                          document.id!
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* Warranty modal */}

      {isWarrantyModalOpen && (
        <AddWarrantyModal
          productId={id}
          warranty={
            editingWarranty ??
            undefined
          }
          onClose={
            closeWarrantyModal
          }
        />
      )}

      {/* Document modal */}

      {isDocumentModalOpen && (
        <AddDocumentModal
          productId={id}
          onClose={
            closeDocumentModal
          }
        />
      )}
    </section>
  );
}

export default ProductDetails;