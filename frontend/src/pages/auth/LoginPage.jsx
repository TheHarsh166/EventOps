import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { AppLogo } from "../../components/common/AppLogo.jsx";
import { Button } from "../../components/common/Button.jsx";
import { FormField } from "../../components/forms/FormField.jsx";
import { PasswordField } from "../../components/forms/PasswordField.jsx";
import { getErrorMessage } from "../../services/api.js";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user?.name || "Attendee"}!`);
      if (searchParams.get("redirect")) {
        navigate(searchParams.get("redirect"));
      } else if (res.user?.role === "ADMIN") {
        navigate("/admin");
      } else if (res.user?.role === "ORGANIZER") {
        navigate("/organizer");
      } else {
        navigate("/app");
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Invalid email or password");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <AppLogo className="justify-center" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Or{" "}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            create a new EventOps account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <FormField label="Email address" id="login-email" required>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </FormField>

            <FormField label="Password" id="login-password" required>
              <PasswordField
                id="login-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Protected with encrypted session tokens</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-indigo-100"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
