import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { AuthView } from "./pages/AuthView";
import { AppLayout } from "./pages/AppLayout";

const AppContent = () => {
  const { isAuthenticated, authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <div className="app-loading">
        <p>Loading…</p>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <AuthView />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
