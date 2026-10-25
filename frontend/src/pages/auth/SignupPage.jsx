import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { AppLogo } from "../../components/common/AppLogo.jsx";
import { Button } from "../../components/common/Button.jsx";
import { FormField } from "../../components/forms/FormField.jsx";
import { PasswordField } from "../../components/forms/PasswordField.jsx";
import { getErrorMessage } from "../../services/api.js";
import { User, ShieldCheck } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "ORGANIZER" ? "ORGANIZER" : "ATTENDEE";

  const { registerAttendee, registerOrganizer, login } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (role === "ORGANIZER") {
        await registerOrganizer({ name, email, password });
      } else {
        await registerAttendee({ name, email, password });
      }

      toast.success("Account created successfully! Logging you in...");
      // Auto-login newly registered user
      await login(email, password);
      navigate("/");
    } catch (err) {
      const msg = getErrorMessage(err, "Registration failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <AppLogo className="justify-center" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create your EventOps account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {/* Role Switcher Tab */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-2">
              Select Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("ATTENDEE")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  role === "ATTENDEE"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <User className="w-3.5 h-3.5" />
                Attendee
              </button>
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  role === "ORGANIZER"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Organizer
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {role === "ORGANIZER"
                ? "Organizers can create events, manage tickets, and review revenue."
                : "Attendees can register for conferences, pay, and join waitlists."}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <FormField label="Full Name" id="signup-name" required>
              <input
                id="signup-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </FormField>

            <FormField label="Email address" id="signup-email" required>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </FormField>

            <FormField label="Password" id="signup-password" required>
              <PasswordField
                id="signup-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-indigo-100 mt-2"
              loading={loading}
            >
              Create {role === "ORGANIZER" ? "Organizer" : "Attendee"} Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
