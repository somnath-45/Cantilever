import React, { useState, useContext } from "react";
import { LayoutDashboard, CheckSquare, Menu, Search, LogOut, Trash2, UserCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { TaskProvider } from "../context/TaskContext";
import { DashboardView } from "./DashboardView";
import { ProfileView } from "./ProfileView";
import { TasksView } from "./TasksView";

const AppLayoutInner = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <CheckSquare size={20} />
          </div>
          <span className="sidebar-brand-name">Cantilever</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`nav-item ${activeTab === "dashboard" ? "nav-item--active" : ""}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`nav-item ${activeTab === "tasks" ? "nav-item--active" : ""}`}
          >
            <CheckSquare size={20} /> {user.role === "manager" ? "Team Tasks" : "My Tasks"}
          </button>

          {user.role === "manager" && (
            <button
              onClick={() => setActiveTab("deleted")}
              className={`nav-item ${activeTab === "deleted" ? "nav-item--active" : ""}`}
            >
              <Trash2 size={20} /> Deleted Tasks
            </button>
          )}

          <button
            onClick={() => setActiveTab("profile")}
            className={`nav-item ${activeTab === "profile" ? "nav-item--active" : ""}`}
          >
            <UserCircle size={20} /> My Profile
          </button>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-trigger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>

          <div className="topbar-right">
            {(activeTab === "tasks" || activeTab === "deleted") && (
              <div className="topbar-search fade-in">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={user.role === "manager" ? "Search all tasks..." : "Search my tasks..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="topbar-search-input"
                />
              </div>
            )}

            <div className="topbar-user">
              <div className="topbar-user-info">
                <p className="topbar-user-name">{user.name}</p>
                <p className="topbar-user-role">{user.role}</p>
              </div>
              <button className="avatar" onClick={() => setActiveTab("profile")} aria-label="My profile">
                {user.name.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        <main className="main-scroll">
          <div className="main-inner">
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "profile" && <ProfileView />}
            {activeTab === "tasks" && <TasksView searchQuery={searchQuery} showDeleted={false} />}
            {activeTab === "deleted" && user.role === "manager" && (
              <TasksView searchQuery={searchQuery} showDeleted={true} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export const AppLayout = () => (
  <TaskProvider>
    <AppLayoutInner />
  </TaskProvider>
);

export default AppLayout;
