
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const initialForm = {
  name: "",
  sku: "",
  description: "",
  quantityOnHand: 0,
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [defaultThreshold, setDefaultThreshold] = useState(5);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const limit = 10;

  // Fetch products with server-side search and pagination
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        params: { search, page, limit },
      });

      const data = response.data;

      setProducts(data.products || []);

      setPagination({
        total: data.pagination?.totalProducts ?? 0,
        totalPages: data.pagination?.totalPages ?? 1,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Fetch products whenever search or page changes
  useEffect(() => {
    let cancelled = false;

    api
      .get("/products", {
        params: { search, page, limit },
      })
      .then((response) => {
        if (cancelled) return;

        const data = response.data;

        setProducts(data.products || []);

        setPagination({
          total: data.pagination?.totalProducts ?? 0,
          totalPages: data.pagination?.totalPages ?? 1,
        });

        setError("");
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err.response?.data?.message || "Unable to load products."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page]);

  // Fetch organization default low-stock threshold
  useEffect(() => {
    let cancelled = false;

    api
      .get("/settings")
      .then((response) => {
        if (!cancelled) {
          setDefaultThreshold(
            response.data.settings?.defaultLowStockThreshold ?? 5
          );
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Unable to load stock threshold:", err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Open the add product form
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...initialForm });
    setFormError("");
    setModalOpen(true);
  };

  // Open the edit product form
  const openEditModal = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantityOnHand: product.quantityOnHand ?? 0,
      costPrice: product.costPrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      lowStockThreshold: product.lowStockThreshold ?? "",
    });

    setFormError("");
    setModalOpen(true);
  };

  // Close the product modal
  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setFormError("");
  };

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create or update a product
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError("Product name and SKU are required.");
      return;
    }

    const quantity = Number(formData.quantityOnHand);

    if (!Number.isInteger(quantity) || quantity < 0) {
      setFormError("Quantity must be a non-negative whole number.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim() || null,
      quantityOnHand: quantity,
      costPrice:
        formData.costPrice === "" ? null : Number(formData.costPrice),
      sellingPrice:
        formData.sellingPrice === "" ? null : Number(formData.sellingPrice),
      lowStockThreshold:
        formData.lowStockThreshold === ""
          ? null
          : Number(formData.lowStockThreshold),
    };

    if (
      (payload.costPrice !== null &&
        (!Number.isFinite(payload.costPrice) || payload.costPrice < 0)) ||
      (payload.sellingPrice !== null &&
        (!Number.isFinite(payload.sellingPrice) ||
          payload.sellingPrice < 0)) ||
      (payload.lowStockThreshold !== null &&
        (!Number.isInteger(payload.lowStockThreshold) ||
          payload.lowStockThreshold < 0))
    ) {
      setFormError(
        "Prices and stock threshold must be valid non-negative numbers."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/products", payload);
      }

      const wasEditing = Boolean(editingProduct);

      setModalOpen(false);
      setEditingProduct(null);
      setFormData({ ...initialForm });

      if (!wasEditing && page !== 1) {
        setLoading(true);
        setPage(1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete a product after confirmation
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${product.id}`);

      if (products.length === 1 && page > 1) {
        setLoading(true);
        setPage((current) => current - 1);
      } else {
        await fetchProducts();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete product."
      );
    }
  };

  // Format product prices
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "—";
    }

    const amount = Number(price);

    return Number.isFinite(amount)
      ? `₹${amount.toFixed(2)}`
      : "—";
  };

  return (
    <AppLayout title="Products">
      <div className="products-heading">
        <div>
          <h1>Product Inventory</h1>
          <p>Manage and monitor all your inventory items.</p>
        </div>

        <button className="primary-button" onClick={openAddModal}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(event) => {
              setLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <span className="product-total">
          {pagination.total} products
        </span>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="products-table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-message">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-message">
                  <Package size={25} />
                  <span>No products found.</span>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const threshold =
                  product.lowStockThreshold ?? defaultThreshold;

                const isLowStock =
                  product.quantityOnHand <= threshold;

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-name-cell">
                        <strong>{product.name}</strong>
                        <span>
                          {product.description || "No description"}
                        </span>
                      </div>
                    </td>

                    <td>{product.sku}</td>
                    <td>{product.quantityOnHand}</td>
                    <td>{formatPrice(product.costPrice)}</td>
                    <td>{formatPrice(product.sellingPrice)}</td>

                    <td>
                      <span
                        className={`stock-badge ${
                          isLowStock ? "low" : "available"
                        }`}
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button edit"
                          title="Edit product"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-button delete"
                          title="Delete product"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span>
          Page {page} of {Math.max(1, pagination.totalPages)}
        </span>

        <div>
          <button
            onClick={() => {
              setLoading(true);
              setPage((current) => current - 1);
            }}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() => {
              setLoading(true);
              setPage((current) => current + 1);
            }}
            disabled={page >= pagination.totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="product-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p>Enter the product details below.</p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="auth-error">
                {formError}
              </div>
            )}

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="product-name">
                    Product name *
                  </label>

                  <input
                    id="product-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Mouse"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-sku">SKU *</label>

                  <input
                    id="product-sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. WM-001"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="product-description">
                    Description
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe this product..."
                    rows="3"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-quantity">
                    Quantity *
                  </label>

                  <input
                    id="product-quantity"
                    name="quantityOnHand"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantityOnHand}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-threshold">
                    Low-stock threshold
                  </label>

                  <input
                    id="product-threshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    placeholder="Use organization default"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-cost">
                    Cost price (₹)
                  </label>

                  <input
                    id="product-cost"
                    name="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="product-selling">
                    Selling price (₹)
                  </label>

                  <input
                    id="product-selling"
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Save Changes"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Products;
