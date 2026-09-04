import { useState } from "react";
import { db } from "../db/database";

type Props = {
  productId: number;
  onClose: () => void;
};

function AddWarrantyModal({
  productId,
  onClose,
}: Props) {
  const [formData, setFormData] = useState({
    provider: "",
    type: "manufacturer",
    startDate: "",
    endDate: "",
    coverage: "",
    exclusions: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const now = new Date().toISOString();

    await db.warranties.add({
      productId,
      provider: formData.provider.trim(),
      type: formData.type as
        | "manufacturer"
        | "seller"
        | "extended"
        | "other",
      startDate: formData.startDate,
      endDate: formData.endDate,
      coverage: formData.coverage.trim(),
      exclusions: formData.exclusions.trim(),
      createdAt: now,
      updatedAt: now,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Warranty</p>
            <h3>Add warranty</h3>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="provider">
              Warranty provider
            </label>

            <input
              id="provider"
              name="provider"
              type="text"
              placeholder="e.g. Apple"
              value={formData.provider}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">
              Warranty type
            </label>

            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start date
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                End date
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="coverage">
              Coverage
            </label>

            <textarea
              id="coverage"
              name="coverage"
              placeholder="What does this warranty cover?"
              value={formData.coverage}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="exclusions">
              Exclusions
            </label>

            <textarea
              id="exclusions"
              name="exclusions"
              placeholder="What is not covered?"
              value={formData.exclusions}
              onChange={handleChange}
              rows={3}
            />
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
              type="submit"
              className="primary-button"
            >
              Add Warranty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWarrantyModal;