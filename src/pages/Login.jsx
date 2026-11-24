import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "@tanstack/react-router";

import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../context/ThemeContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),

    onSuccess: () => {
      navigate({ to: "/dashboard" });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    loginMutation.mutate();
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand-row">
          <h1 className="auth-logo">
            Shipyard<span>.</span>
          </h1>
          <ThemeToggle />
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">
          Login to continue managing your projects.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {loginMutation.isError && (
            <p className="error-message">{loginMutation.error.message}</p>
          )}

          <button
            className="btn btn-primary btn-full login-button"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
