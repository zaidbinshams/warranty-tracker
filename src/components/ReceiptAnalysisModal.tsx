import { useState } from "react";
import type { ChangeEvent } from "react";

import {
  validateFile,
  formatFileSize,
} from "../utils/files";

type ExtractedProduct = {
  name: string;
  brand: string;
  model: string;
  purchaseDate: string;
  purchasePrice: number;
  currency: string;
  seller: string;
};

type ExtractedWarranty = {
  provider: string;
  type:
    | "manufacturer"
    | "seller"
    | "extended"
    | "other";
  durationMonths: number;
  startDate: string;
};

type Props = {
  onClose: () => void;

  onComplete: (
    product: ExtractedProduct,
    warranty: ExtractedWarranty
  ) => void;
};

function ReceiptAnalysisModal({
  onClose,
  onComplete,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [error, setError] =
    useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [isComplete, setIsComplete] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [product, setProduct] =
    useState<ExtractedProduct | null>(null);

  const [warranty, setWarranty] =
    useState<ExtractedWarranty | null>(null);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError =
      validateFile(selectedFile);

    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selectedFile);
  };

  const analyzeReceipt = async () => {
    if (!file) {
      return;
    }

    setError("");
    setIsAnalyzing(true);

    /*
     * Temporary mock AI response.
     *
     * This will later be replaced by the
     * real backend/AI request.
     */

    await new Promise((resolve) =>
      setTimeout(resolve, 1800)
    );

    const mockProduct: ExtractedProduct = {
      name: "MacBook Air",
      brand: "Apple",
      model: "A3113",
      purchaseDate: "2026-08-15",
      purchasePrice: 104999,
      currency: "INR",
      seller: "Amazon",
    };

    const mockWarranty: ExtractedWarranty = {
      provider: "Apple",
      type: "manufacturer",
      durationMonths: 12,
      startDate: "2026-08-15",
    };

    setProduct(mockProduct);
    setWarranty(mockWarranty);

    setIsAnalyzing(false);
    setIsComplete(true);
    setIsEditing(false);
  };

  const updateProductField = (
    field: keyof ExtractedProduct,
    value: string
  ) => {
    setProduct((current) => {
      if (!current) {
        return current;
      }

      if (field === "purchasePrice") {
        return {
          ...current,
          purchasePrice:
            Number(value) || 0,
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const updateWarrantyField = (
    field: keyof ExtractedWarranty,
    value: string
  ) => {
    setWarranty((current) => {
      if (!current) {
        return current;
      }

      if (field === "durationMonths") {
        return {
          ...current,
          durationMonths:
            Number(value) || 0,
        };
      }

      if (field === "type") {
        return {
          ...current,
          type: value as ExtractedWarranty["type"],
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleSave = () => {
    if (!product || !warranty) {
      return;
    }

    onComplete(product, warranty);
  };

  const handleAnalyzeAgain = () => {
    setIsComplete(false);
    setIsEditing(false);
    setProduct(null);
    setWarranty(null);
    setError("");
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal receipt-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {!isComplete ? (
          <>
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Smart Import
                </p>

                <h3>
                  Import a receipt
                </h3>
              </div>

              <button
                className="close-button"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="modal-description">
              Upload a receipt and Warranty
              Tracker will extract the
              product information for you.
            </p>

            <div className="form-group">
              <label htmlFor="receipt-file">
                Receipt
              </label>

              <input
                id="receipt-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            </div>

            {error && (
              <div className="file-error">
                {error}
              </div>
            )}

            {file && !error && (
              <div className="selected-file">
                <span>
                  Selected receipt
                </span>

                <strong>
                  {file.name}
                </strong>

                <small>
                  {formatFileSize(
                    file.size
                  )}
                </small>
              </div>
            )}

            <div className="privacy-notice">
              <strong>
                Privacy
              </strong>

              <p>
                Your receipt remains on
                this device unless you
                explicitly choose to analyze
                it with AI.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary-button"
                disabled={
                  !file ||
                  Boolean(error) ||
                  isAnalyzing
                }
                onClick={analyzeReceipt}
              >
                {isAnalyzing
                  ? "Analyzing..."
                  : "Analyze with AI"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Review
                </p>

                <h3>
                  We found this information
                </h3>
              </div>

              <button
                className="close-button"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="review-actions">
              <p className="review-hint">
                {isEditing
                  ? "Edit anything that looks incorrect before saving."
                  : "Review the extracted information before saving."}
              </p>

              <button
                type="button"
                className={
                  isEditing
                    ? "secondary-button"
                    : "primary-button"
                }
                onClick={() =>
                  setIsEditing(
                    (current) => !current
                  )
                }
              >
                {isEditing
                  ? "Done Editing"
                  : "Edit Information"}
              </button>
            </div>

            {/* Product */}

            <div className="extraction-section">
              <div className="extraction-heading">
                <h4>Product</h4>

                <span>
                  Extracted from receipt
                </span>
              </div>

              <div className="extraction-grid">
                <div className="extraction-field">
                  <span>
                    Product name
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="text"
                      value={product?.name ?? ""}
                      onChange={(event) =>
                        updateProductField(
                          "name",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {product?.name}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Brand
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="text"
                      value={product?.brand ?? ""}
                      onChange={(event) =>
                        updateProductField(
                          "brand",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {product?.brand}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Model
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="text"
                      value={product?.model ?? ""}
                      onChange={(event) =>
                        updateProductField(
                          "model",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {product?.model}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Purchase date
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="date"
                      value={
                        product?.purchaseDate ??
                        ""
                      }
                      onChange={(event) =>
                        updateProductField(
                          "purchaseDate",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {product?.purchaseDate}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Purchase price
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="number"
                      min="0"
                      value={
                        product?.purchasePrice ??
                        0
                      }
                      onChange={(event) =>
                        updateProductField(
                          "purchasePrice",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      ₹
                      {product?.purchasePrice.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Seller
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="text"
                      value={product?.seller ?? ""}
                      onChange={(event) =>
                        updateProductField(
                          "seller",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {product?.seller}
                    </strong>
                  )}
                </div>
              </div>
            </div>

            {/* Warranty */}

            <div className="extraction-section">
              <div className="extraction-heading">
                <h4>Warranty</h4>

                <span>
                  Extracted information
                </span>
              </div>

              <div className="extraction-grid">
                <div className="extraction-field">
                  <span>
                    Provider
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="text"
                      value={
                        warranty?.provider ??
                        ""
                      }
                      onChange={(event) =>
                        updateWarrantyField(
                          "provider",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {warranty?.provider}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Type
                  </span>

                  {isEditing ? (
                    <select
                      className="extraction-input"
                      value={
                        warranty?.type ??
                        "manufacturer"
                      }
                      onChange={(event) =>
                        updateWarrantyField(
                          "type",
                          event.target.value
                        )
                      }
                    >
                      <option value="manufacturer">
                        Manufacturer
                      </option>

                      <option value="seller">
                        Seller
                      </option>

                      <option value="extended">
                        Extended
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>
                  ) : (
                    <strong>
                      {warranty?.type}
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Duration
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="number"
                      min="1"
                      value={
                        warranty?.durationMonths ??
                        1
                      }
                      onChange={(event) =>
                        updateWarrantyField(
                          "durationMonths",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {warranty?.durationMonths}{" "}
                      months
                    </strong>
                  )}
                </div>

                <div className="extraction-field">
                  <span>
                    Start date
                  </span>

                  {isEditing ? (
                    <input
                      className="extraction-input"
                      type="date"
                      value={
                        warranty?.startDate ??
                        ""
                      }
                      onChange={(event) =>
                        updateWarrantyField(
                          "startDate",
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <strong>
                      {warranty?.startDate}
                    </strong>
                  )}
                </div>
              </div>
            </div>

            <div className="privacy-notice">
              <strong>
                Review before saving
              </strong>

              <p>
                AI-generated information can
                be incorrect. Review and edit
                the extracted information
                before adding it to your vault.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleAnalyzeAgain}
              >
                Analyze Again
              </button>

              <button
                type="button"
                className="primary-button"
                onClick={handleSave}
              >
                Add to Warranty Tracker
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReceiptAnalysisModal;