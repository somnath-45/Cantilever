import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ErrorBanner } from "../components/ErrorBanner";
import { extractErrorMessage } from "../api/client";

const ROLE_LABEL = { manager: "Manager", contributor: "Contributor" };

export const ProfileView = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await updateProfile({ name, email });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't update your profile."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="stack fade-in">
      <div className="page-heading">
        <h1>My Profile</h1>
        <p>Update your personal information.</p>
      </div>
      <Card className="card--padded card--narrow">
        <form onSubmit={handleSave} className="form-stack">
          {error && <ErrorBanner message={error} />}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="input" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role (Read-only)</label>
            <input value={ROLE_LABEL[user.role] || user.role} disabled className="input input-disabled" />
          </div>
          <div className="form-footer">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {message && <span className="form-success">{message}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfileView;
