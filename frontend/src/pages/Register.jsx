
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Mail, Lock, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.organizationName.trim() ||
      !formData.email.trim() ||
      !formData.password
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      await register({
        ...formData,
        organizationName: formData.organizationName.trim(),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-icon">
          <Package size={25} />
        </div>
        <span>StockFlow</span>
      </div>

      <div className="auth-card">
        <div className="auth-heading">
          <h1>Create your account</h1>
          <p>Set up your organization and start managing inventory.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="organizationName">Organization name</label>
          <div className="auth-input">
            <Building2 size={18} />
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="Your company name"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="email">Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="auth-input">
            <Lock size={18} />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <p className="auth-copyright">
        © 2026 StockFlow. Inventory management made simple.
      </p>
    </div>
  );
};

export default Register;
