import { useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  db,
  type DocumentType,
} from "../db/database";

import {
  validateFile,
  formatFileSize,
} from "../utils/files";

type Props = {
  productId: number;
  onClose: () => void;
};

function AddDocumentModal({
  productId,
  onClose,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [type, setType] =
    useState<DocumentType>("receipt");

  const [error, setError] =
    useState<string>("");

  const [isSaving, setIsSaving] =
    useState(false);

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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!file) {
      setError(
        "Please select a valid document."
      );
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await db.documents.add({
        productId,
        name: file.name,
        type,
        mimeType: file.type,
        size: file.size,
        file,
        createdAt:
          new Date().toISOString(),
      });

      onClose();
    } catch {
      setError(
        "The document could not be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
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
              Documents
            </p>

            <h3>Add document</h3>
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="document-type">
              Document type
            </label>

            <select
              id="document-type"
              value={type}
              onChange={(event) =>
                setType(
                  event.target
                    .value as DocumentType
                )
              }
            >
              <option value="receipt">
                Receipt
              </option>

              <option value="warranty">
                Warranty
              </option>

              <option value="manual">
                Manual
              </option>

              <option value="service">
                Service
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="document-file">
              File
            </label>

            <input
              id="document-file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              required
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
                Selected file
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

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                !file ||
                Boolean(error) ||
                isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : "Add Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDocumentModal;