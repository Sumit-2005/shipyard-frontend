import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { registerUser } from "../api/auth";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const registerMutation = useMutation({
    mutationFn: () => registerUser(email, password),

    onSuccess: () => {
      navigate({ to: "/login" });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    registerMutation.mutate();
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">
          Shipyard<span>.</span>
        </h1>

        <h2 className="auth-title">Create an account</h2>

        <p className="auth-subtitle">
          Get started by creating your Shipyard account.
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {registerMutation.isError && (
            <p className="error-message">{registerMutation.error.message}</p>
          )}

          {registerMutation.isSuccess && (
            <p className="success-message">
              Account created successfully! Redirecting to login...
            </p>
          )}

          <button
            className="btn btn-primary btn-full register-button"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
