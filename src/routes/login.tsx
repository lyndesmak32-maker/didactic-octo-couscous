import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, type FormEvent } from "react";
import { useAuth } from "../auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in — redirect to dashboard
  if (user) {
    navigate({ to: "/dashboard", replace: true });
    return null;
  }

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
        await login(email.trim(), password);
        navigate({ to: "/dashboard", replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, login, navigate],
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </a>
        </div>

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-indigo-200">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            LeadFlow
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-all focus:outline-none focus:ring-3 focus:ring-indigo-100 disabled:opacity-60 ${
                  error
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-300 focus:border-indigo-400"
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isSubmitting}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition-all focus:outline-none focus:ring-3 focus:ring-indigo-100 disabled:opacity-60 ${
                  error
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-gray-300 focus:border-indigo-400"
                }`}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>

        {/* Link to register */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Sign up
          </a>
        </p>

        {/* Link to pricing */}
        <p className="mt-3 text-center text-sm text-gray-400">
          <a
            href="/pricing"
            className="font-medium text-gray-500 hover:text-indigo-600 transition-colors"
          >
            View pricing
          </a>
        </p>
      </div>
    </div>
  );
}
