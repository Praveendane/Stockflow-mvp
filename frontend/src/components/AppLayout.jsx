
import { useAuth } from "../context/useAuth";
import Sidebar from "./Sidebar";

const AppLayout = ({ children, title }) => {
  const { user } = useAuth();

  const initials = user?.organizationName
    ? user.organizationName.slice(0, 2).toUpperCase()
    : "SF";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>Manage your inventory in one place.</p>
          </div>

          <div className="topbar-profile">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-details">
              <strong>{user?.organizationName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </header>

        <section className="page-content">{children}</section>
      </main>
    </div>
  );
};

export default AppLayout;
