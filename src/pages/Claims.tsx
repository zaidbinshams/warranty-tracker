import { useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  db,
  type Claim,
  type ClaimStatus,
} from "../db/database";

import {
  useClaims,
  useProducts,
  useWarranties,
} from "../db/hooks";

import { getWarrantyStatus } from "../utils/warranty";

const STATUS_LABELS: Record<
  ClaimStatus,
  string
> = {
  draft: "Draft",
  submitted: "Submitted",
  resolved: "Resolved",
  rejected: "Rejected",
};

function formatDate(
  dateString?: string
) {
  if (!dateString) {
    return "Not submitted";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function Claims() {
  const claims = useClaims();
  const products = useProducts();
  const warranties = useWarranties();

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [
    editingClaim,
    setEditingClaim,
  ] = useState<Claim | null>(null);

  const [productId, setProductId] =
    useState("");

  const [warrantyId, setWarrantyId] =
    useState("");

  const [status, setStatus] =
    useState<ClaimStatus>("draft");

  const [
    submissionDate,
    setSubmissionDate,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const resetForm = () => {
    setProductId("");
    setWarrantyId("");
    setStatus("draft");
    setSubmissionDate("");
    setNotes("");
    setEditingClaim(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const openCreateClaimModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditClaimModal = (
    claim: Claim
  ) => {
    setEditingClaim(claim);

    setProductId(
      String(claim.productId)
    );

    setWarrantyId(
      String(claim.warrantyId)
    );

    setStatus(claim.status);

    setSubmissionDate(
      claim.submissionDate ?? ""
    );

    setNotes(claim.notes);

    setIsModalOpen(true);
  };

  const selectedProductId =
    Number(productId);

  const availableWarranties =
    warranties?.filter(
      (warranty) =>
        warranty.productId ===
        selectedProductId
    ) ?? [];

  const selectedProduct =
    products?.find(
      (product) =>
        product.id ===
        selectedProductId
    );

  const hasNoWarranty =
    Boolean(
      productId &&
        availableWarranties.length ===
          0
    );

  const handleProductChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const nextProductId =
      event.target.value;

    setProductId(nextProductId);
    setWarrantyId("");
  };

  const handleSaveClaim = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const selectedProduct =
      Number(productId);

    const selectedWarranty =
      Number(warrantyId);

    if (
      !selectedProduct ||
      !selectedWarranty
    ) {
      return;
    }

    if (
      availableWarranties.length === 0
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    const claimData = {
      productId: selectedProduct,
      warrantyId: selectedWarranty,
      status,
      submissionDate:
        submissionDate || undefined,
      notes: notes.trim(),
      updatedAt: now,
    };

    if (editingClaim?.id) {
      await db.claims.update(
        editingClaim.id,
        claimData
      );
    } else {
      await db.claims.add({
        ...claimData,
        createdAt: now,
      });
    }

    closeModal();
  };

  const handleDeleteClaim =
    async (claim: Claim) => {
      if (!claim.id) {
        return;
      }

      const productName =
        products?.find(
          (product) =>
            product.id ===
            claim.productId
        )?.name ??
        "this product";

      const confirmed =
        window.confirm(
          `Delete the claim for "${productName}"? This cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        await db.claims.delete(
          claim.id
        );
      } catch (error) {
        console.error(
          "Failed to delete claim:",
          error
        );

        window.alert(
          "The claim could not be deleted. Please try again."
        );
      }
    };

  const getProductName = (
    id: number
  ) => {
    return (
      products?.find(
        (product) =>
          product.id === id
      )?.name ??
      "Unknown product"
    );
  };

  const getWarranty = (
    id: number
  ) => {
    return warranties?.find(
      (warranty) =>
        warranty.id === id
    );
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Claims
          </p>

          <h3>
            Warranty claims
          </h3>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="primary-button"
            onClick={
              openCreateClaimModal
            }
          >
            Start a Claim
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card green-card">
          <p>Total claims</p>

          <strong>
            {claims?.length ?? 0}
          </strong>

          <span>
            All claim records
          </span>
        </div>

        <div className="stat-card blue-card">
          <p>Drafts</p>

          <strong>
            {claims?.filter(
              (claim) =>
                claim.status ===
                "draft"
            ).length ?? 0}
          </strong>

          <span>
            Not submitted yet
          </span>
        </div>

        <div className="stat-card light-card">
          <p>Submitted</p>

          <strong>
            {claims?.filter(
              (claim) =>
                claim.status ===
                "submitted"
            ).length ?? 0}
          </strong>

          <span>
            Awaiting resolution
          </span>
        </div>

        <div className="stat-card dark-card">
          <p>Resolved</p>

          <strong>
            {claims?.filter(
              (claim) =>
                claim.status ===
                "resolved"
            ).length ?? 0}
          </strong>

          <span>
            Successfully completed
          </span>
        </div>
      </div>

      {!claims ||
      claims.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            +
          </div>

          <h4>
            No claims yet
          </h4>

          <p>
            Start a claim when a
            product needs warranty
            service or replacement.
          </p>

          <div className="page-actions">
            <button
              type="button"
              className="primary-button"
              onClick={
                openCreateClaimModal
              }
            >
              Start your first claim
            </button>
          </div>
        </div>
      ) : (
        <div className="product-list">
          {claims.map((claim) => {
            const warranty =
              getWarranty(
                claim.warrantyId
              );

            const warrantyStatus =
              warranty
                ? getWarrantyStatus(
                    warranty.endDate
                  )
                : "expired";

            return (
              <article
                className="product-card"
                key={claim.id}
              >
                <div className="claim-information">
                  <p className="product-brand">
                    {
                      STATUS_LABELS[
                        claim.status
                      ]
                    }
                  </p>

                  <h4>
                    {getProductName(
                      claim.productId
                    )}
                  </h4>

                  <p className="product-model">
                    {warranty
                      ? `${warranty.provider} · ${warranty.type}`
                      : "Warranty unavailable"}
                  </p>
                </div>

                <div className="product-date">
                  <span>
                    Warranty
                  </span>

                  <strong>
                    {warranty
                      ? warrantyStatus
                      : "Unknown"}
                  </strong>

                  <span>
                    Claim submitted
                  </span>

                  <strong>
                    {formatDate(
                      claim.submissionDate
                    )}
                  </strong>
                </div>

                {claim.notes && (
                  <div className="product-model">
                    {claim.notes}
                  </div>
                )}

                <div className="product-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      openEditClaimModal(
                        claim
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDeleteClaim(
                        claim
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

      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={closeModal}
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
                  {editingClaim
                    ? "Edit claim"
                    : "New claim"}
                </p>

                <h3>
                  {editingClaim
                    ? "Edit warranty claim"
                    : "Start a warranty claim"}
                </h3>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                handleSaveClaim
              }
            >
              <div className="form-group">
                <label htmlFor="claim-product">
                  Product
                </label>

                <select
                  id="claim-product"
                  value={productId}
                  onChange={
                    handleProductChange
                  }
                  required
                >
                  <option value="">
                    Select a product
                  </option>

                  {products?.map(
                    (product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {hasNoWarranty && (
                <div className="no-warranty">
                  <strong>
                    This product has no
                    warranty
                  </strong>

                  <p>
                    Add a warranty to
                    this product before
                    starting a claim.
                  </p>

                  <div
                    className="page-actions"
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    <a
                      href="/products"
                      className="secondary-button"
                    >
                      Go to Products
                    </a>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="claim-warranty">
                  Warranty
                </label>

                <select
                  id="claim-warranty"
                  value={warrantyId}
                  onChange={(event) =>
                    setWarrantyId(
                      event.target.value
                    )
                  }
                  disabled={
                    !selectedProductId ||
                    hasNoWarranty
                  }
                  required
                >
                  <option value="">
                    {!selectedProductId
                      ? "Select a product first"
                      : availableWarranties.length ===
                          0
                        ? "No warranties found"
                        : "Select a warranty"}
                  </option>

                  {availableWarranties.map(
                    (warranty) => (
                      <option
                        key={warranty.id}
                        value={warranty.id}
                      >
                        {
                          warranty.provider
                        }{" "}
                        ·{" "}
                        {
                          warranty.type
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {selectedProduct && (
                <div className="form-group">
                  <label>
                    Product selected
                  </label>

                  <span className="product-model">
                    {selectedProduct.name}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="claim-status">
                  Status
                </label>

                <select
                  id="claim-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as ClaimStatus
                    )
                  }
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="submitted">
                    Submitted
                  </option>

                  <option value="resolved">
                    Resolved
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="claim-date">
                  Submission date
                </label>

                <input
                  id="claim-date"
                  type="date"
                  value={
                    submissionDate
                  }
                  onChange={(event) =>
                    setSubmissionDate(
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="claim-notes">
                  Notes
                </label>

                <textarea
                  id="claim-notes"
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  placeholder="Describe the issue or claim details"
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    !productId ||
                    !warrantyId ||
                    hasNoWarranty
                  }
                >
                  {editingClaim
                    ? "Save Changes"
                    : "Create Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Claims;