import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  db,
  type DocumentType,
} from "../db/database";

import {
  useDocuments,
  useProducts,
} from "../db/hooks";

type FilterType =
  | "all"
  | DocumentType;

function Documents() {
  const documents = useDocuments();
  const products = useProducts();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterType, setFilterType] =
    useState<FilterType>("all");

  const getProductName = (
    productId: number
  ) => {
    const product = products?.find(
      (item) => item.id === productId
    );

    return product?.name ?? "Unknown product";
  };

  const filteredDocuments = useMemo(() => {
    if (!documents) {
      return [];
    }

    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesType =
        filterType === "all" ||
        document.type === filterType;

      if (!matchesType) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const productName =
        getProductName(
          document.productId
        ).toLowerCase();

      return (
        document.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        productName.includes(
          normalizedSearch
        )
      );
    });
  }, [
    documents,
    products,
    searchTerm,
    filterType,
  ]);

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

  const handleDeleteDocument = async (
    documentId: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
      return;
    }

    await db.documents.delete(documentId);
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            Documents
          </p>

          <h3>
            Your documents
          </h3>
        </div>
      </div>

      <div className="document-toolbar">
        <div className="document-search">
          <label htmlFor="document-search">
            Search
          </label>

          <input
            id="document-search"
            type="search"
            placeholder="Search documents or products"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
        </div>

        <div className="document-filter">
          <label htmlFor="document-filter">
            Type
          </label>

          <select
            id="document-filter"
            value={filterType}
            onChange={(event) =>
              setFilterType(
                event.target
                  .value as FilterType
              )
            }
          >
            <option value="all">
              All documents
            </option>

            <option value="receipt">
              Receipts
            </option>

            <option value="warranty">
              Warranties
            </option>

            <option value="manual">
              Manuals
            </option>

            <option value="service">
              Service
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>
      </div>

      {!documents ? (
        <div className="empty-state">
          <h4>
            Loading documents
          </h4>

          <p>
            Your local documents are
            being loaded.
          </p>
        </div>
      ) : filteredDocuments.length ===
        0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            +
          </div>

          <h4>
            {documents.length === 0
              ? "No documents yet"
              : "No matching documents"}
          </h4>

          <p>
            {documents.length === 0
              ? "Upload a receipt, warranty card, manual, or service document from a product."
              : "Try changing your search or document type filter."}
          </p>
        </div>
      ) : (
        <div className="document-list">
          {filteredDocuments.map(
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
                    {getProductName(
                      document.productId
                    )}
                  </p>

                  <p className="document-meta">
                    {(
                      document.size /
                      1024
                    ).toFixed(1)}{" "}
                    KB
                  </p>
                </div>

                <div className="document-actions">
                  <Link
                    to={`/products/${document.productId}`}
                    className="secondary-button link-button"
                  >
                    Product
                  </Link>

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
  );
}

export default Documents;