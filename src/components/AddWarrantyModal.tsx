import { useEffect, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  db,
  type Warranty,
} from "../db/database";
import { addMonths } from "../utils/date";

type Props = {
  productId: number;
  warranty?: Warranty;
  onClose: () => void;
};

function AddWarrantyModal({
  productId,
  warranty,
  onClose,
}: Props) {
  const isEditing = Boolean(warranty);

  const [formData, setFormData] = useState({
    provider: "",
    type: "manufacturer",
    startDate: "",
    durationMonths: "",
    coverage: "",
    exclusions: "",
  });

  useEffect(() => {
    if (warranty) {
      setFormData({
        provider: warranty.provider,
        type: warranty.type,
        startDate: warranty.startDate,
        durationMonths: String(
          warranty.durationMonths
        ),
        coverage: warranty.coverage,
        exclusions: warranty.exclusions,
      });

      return;
    }

    setFormData({
      provider: "",
      type: "manufacturer",
      startDate: "",
      durationMonths: "",
      coverage: "",
      exclusions: "",
    });
  }, [warranty]);

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const durationMonths =
    Number(formData.durationMonths);

  const endDate =
    formData.startDate &&
    durationMonths > 0
      ? addMonths(
          formData.startDate,
          durationMonths
        )
      : "";

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !formData.startDate ||
      !durationMonths ||
      durationMonths <= 0
    ) {
      return;
    }

    const now = new Date().toISOString();

    const warrantyData = {
      productId,
      provider: formData.provider.trim(),

      type: formData.type as
        | "manufacturer"
        | "seller"
        | "extended"
        | "other",

      startDate: formData.startDate,
      durationMonths,
      endDate,

      coverage: formData.coverage.trim(),
      exclusions: formData.exclusions.trim(),
      updatedAt: now,
    };

    if (isEditing && warranty?.id) {
      await db.warranties.update(
        warranty.id,
        warrantyData
      );
    } else {
      await db.warranties.add({
        ...warrantyData,
        createdAt: now,
      });
    }

    onClose();
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
              Warranty
            </p>

            <h3>
              {isEditing
                ? "Edit warranty"
                : "Add warranty"}
            </h3>
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
              <label htmlFor="durationMonths">
                Duration
              </label>

              <select
                id="durationMonths"
                name="durationMonths"
                value={formData.durationMonths}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select duration
                </option>

                <option value="1">
                  1 month
                </option>

                <option value="3">
                  3 months
                </option>

                <option value="6">
                  6 months
                </option>

                <option value="12">
                  1 year
                </option>

                <option value="18">
                  18 months
                </option>

                <option value="24">
                  2 years
                </option>

                <option value="36">
                  3 years
                </option>

                <option value="48">
                  4 years
                </option>

                <option value="60">
                  5 years
                </option>
              </select>
            </div>
          </div>

          {endDate && (
            <div className="calculated-date">
              <span>Warranty expires</span>

              <strong>{endDate}</strong>
            </div>
          )}

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
              {isEditing
                ? "Save Changes"
                : "Add Warranty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWarrantyModal;