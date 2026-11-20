
import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon } from "lucide-react";

import AppLayout from "../components/AppLayout";
import api from "../services/api";

const Settings = () => {
  const [threshold, setThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings");

        setThreshold(
          response.data.settings?.defaultLowStockThreshold ?? 5
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load settings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const value = Number(threshold);

    if (!Number.isInteger(value) || value < 0) {
      setError("Threshold must be a non-negative whole number.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put("/settings", {
        defaultLowStockThreshold: value,
      });

      setThreshold(
        response.data.settings.defaultLowStockThreshold
      );

      setMessage("Settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Settings">
      <div className="settings-heading">
        <h1>Organization Settings</h1>
        <p>Configure inventory preferences for your organization.</p>
      </div>

      <div className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">
            <SettingsIcon size={21} />
          </div>

          <div>
            <h3>Inventory Preferences</h3>
            <p>Manage default stock alert preferences.</p>
          </div>
        </div>

        {error && <div className="dashboard-error">{error}</div>}
        {message && <div className="settings-success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="settings-field">
            <label htmlFor="default-threshold">
              Default Low-Stock Threshold
            </label>

            <p>
              Products with stock at or below this quantity will be
              marked as low stock when no product-specific threshold
              is configured.
            </p>

            <input
              id="default-threshold"
              type="number"
              min="0"
              step="1"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              disabled={loading || saving}
            />
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={loading || saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Settings;
