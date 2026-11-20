
import { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    lowStockProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/summary");
      setSummary(response.data.summary);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboard();
    };
    loadDashboard();
  }, []);

  const stats = [
    {
      label: "Total Products",
      value: summary.totalProducts,
      icon: Package,
      color: "blue",
    },
    {
      label: "Total Quantity",
      value: summary.totalQuantity,
      icon: Boxes,
      color: "purple",
    },
    {
      label: "Low Stock Items",
      value: summary.lowStockCount,
      icon: AlertTriangle,
      color: "orange",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="welcome-section dashboard-heading">
        <div>
          <h1>Inventory Overview</h1>
          <p>Monitor your products and stock levels.</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>

              <div>
                <p>{stat.label}</p>
                <h2>
                  {loading ? "..." : stat.value.toLocaleString()}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Low Stock Products</h3>
            <p>Products that need your attention.</p>
          </div>

          <span className="low-stock-count">
            {summary.lowStockCount} items
          </span>
        </div>

        {loading ? (
          <p className="empty-message">Loading inventory data...</p>
        ) : summary.lowStockProducts.length === 0 ? (
          <div className="empty-message">
            <Package size={28} />
            <p>No low-stock products. Your inventory looks good!</p>
          </div>
        ) : (
          <div className="low-stock-list">
            {summary.lowStockProducts.map((product) => (
              <div className="low-stock-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>SKU: {product.sku}</span>
                </div>

                <span className="stock-warning">
                  {product.quantityOnHand} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
