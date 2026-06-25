import React, { useState, useContext } from "react";
import { ShieldAlert } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/Button";
import { ErrorBanner } from "../components/ErrorBanner";
import { extractErrorMessage } from "../api/client";

export const AuthView = () => {
  const { login, signup } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    setSubmitting(true);
    try {
      if (isLogin) {
          await login(data.username, data.password);
        }else {
        await signup(data);
        setIsLogin(true);
        setNotice("Account created — sign in below.");
      }
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          isLogin ? "Couldn't sign in. Check your email and password." : "Couldn't create that account."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <ShieldAlert size={24} />
          </div>
          <h2 className="auth-title">{isLogin ? "Sign In to Workspace" : "Create an Account"}</h2>
          <p className="auth-subtitle">
            {isLogin ? "Welcome back to Cantilever." : "Join the Cantilever task platform."}
          </p>
        </div>

        {notice && <div className="auth-banner banner banner-notice">{notice}</div>}
        {error && (
          <div className="auth-banner">
            <ErrorBanner message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          {!isLogin && (
            <>
              <input name="name" placeholder="Full Name" className="input input--lg" required />
              <select name="role" className="input input--lg" defaultValue="contributor">
                <option value="contributor">Contributor</option>
                <option value="manager">Manager</option>
              </select>
            </>
          )}
          {isLogin ? (
  <input
    name="username"
    type="text"
    placeholder="Username"
    className="input input--lg"
    required
  />
) : (
  <input
    name="email"
    type="email"
    placeholder="Email Address"
    className="input input--lg"
    required
  />
)}
          <input
            name="password"
            type="password"
            placeholder="Password"
            minLength={6}
            className="input input--lg"
            required
          />
          <Button type="submit" className="btn-block" disabled={submitting}>
            {submitting ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setNotice("");
          }}
          className="auth-toggle"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthView;
