/**
 * AUTH PAGE - LOGIN & REGISTRATION
 * Embedded forms for authentication
 */

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks";
import { fetchJson } from "../utils";

const demoEmail = "merchant@flashgateway.local";
const demoPassword = "Password123!";

export default function AuthPage({ session, onSessionUpdate, notify }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const loginForm = useForm(
    { email: demoEmail, password: demoPassword },
    async (values) => {
      try {
        const result = await fetchJson("/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify(values),
        });
        const user = {
          ...result.user,
          full_name: result.user.full_name || result.user.name || result.user.email,
        };
        onSessionUpdate({ token: result.token, user });
        notify(`Welcome back, ${user.full_name}!`, "success");
        navigate("/dashboard");
      } catch (err) {
        setError(err.message);
        notify(err.message, "danger");
      }
    },
  );

  const signupForm = useForm(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: demoPassword,
      confirmPassword: demoPassword,
    },
    async (values) => {
      try {
        if (values.password !== values.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        await fetchJson("/api/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: values.email,
            fullName: `${values.firstName} ${values.lastName}`.trim(),
          }),
        });
        notify("Account created! Sign in to continue.", "success");
        setMode("login");
        loginForm.setFieldValue("email", values.email);
      } catch (err) {
        setError(err.message);
        notify(err.message, "danger");
      }
    },
  );

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 h-16 sm:h-20 flex justify-between items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-headline-md text-lg sm:text-headline-md font-black text-primary tracking-tight whitespace-nowrap">
              PrimeFin SA
            </span>
          </div>
          <Link
            className="text-on-surface-variant font-label-md text-sm sm:text-label-md hover:text-secondary transition-colors whitespace-nowrap"
            to="/"
          >
            Back to landing
          </Link>
        </div>
      </header>

      <main className="pt-16 sm:pt-20">
        <section className="min-h-[calc(100vh-5rem)] grid lg:grid-cols-2">
          {mode === "login" ? (
            <div className="relative overflow-hidden bg-tertiary-container text-on-tertiary px-4 sm:px-10 py-12 sm:py-16 lg:px-16 flex items-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,255,124,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_32%)]"></div>
              <div className="relative z-10 max-w-xl">
                <span className="inline-block py-1 px-3 mb-6 bg-secondary text-on-secondary font-label-sm text-label-sm rounded-full">
                  SECURE SIGN IN
                </span>
                <h1 className="font-display-lg text-display-lg mb-6 leading-[1.05]">
                  Welcome back to PrimeFin SA.
                </h1>
                <p className="font-body-lg text-body-lg text-on-tertiary-container max-w-lg mb-10">
                  Access your account, move funds, and manage money, airtime,
                  and data from one connected workspace.
                </p>
                <div className="space-y-4 max-w-md">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        verified_user
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary truncate">
                        Bank-grade access
                      </p>
                      <p className="font-body-sm text-body-sm text-on-tertiary-container mt-1">
                        MFA and encrypted sessions by default.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        devices
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary truncate">
                        Cross-device continuity
                      </p>
                      <p className="font-body-sm text-body-sm text-on-tertiary-container mt-1">
                        Pick up where you left off across desktop and mobile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden bg-surface px-4 sm:px-10 py-12 sm:py-16 lg:px-16 flex items-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,110,33,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(11,27,48,0.08),transparent_34%)]"></div>
              <div className="relative z-10 max-w-xl">
                <span className="inline-block py-1 px-3 mb-6 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm rounded-full">
                  CREATE YOUR ACCOUNT
                </span>
                <h1 className="font-display-lg text-display-lg text-primary mb-6 leading-[1.05]">
                  Start your PrimeFin journey.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-10">
                  Open a secure account and unlock transfers, airtime, and data
                  management in one place.
                </p>
                <div className="space-y-4 max-w-md">
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        encrypted
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary truncate">
                        Protected onboarding
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Identity checks and secure session setup.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-[22px]">
                        query_stats
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md text-primary truncate">
                        Built for power users
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        A dashboard-first experience for finance-heavy
                        workflows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={`flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 md:px-10 ${mode === "login" ? "bg-surface" : "bg-surface-container-lowest order-1 lg:order-2"}`}
          >
            <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10">
              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm border border-error/20">
                  {error}
                </div>
              )}

              {mode === "login" ? (
                <>
                  <div className="mb-8">
                    <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-3">
                      Sign In
                    </p>
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
                      Access your account
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Use your credentials to continue into the secure FlashGateway
                      workspace.
                    </p>
                  </div>

                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      loginForm.handleSubmit(e);
                    }}
                  >
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Email address
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="email"
                        name="email"
                        value={loginForm.values.email}
                        onChange={loginForm.handleChange}
                        onBlur={loginForm.handleBlur}
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Password
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="password"
                        name="password"
                        value={loginForm.values.password}
                        onChange={loginForm.handleChange}
                        onBlur={loginForm.handleBlur}
                        placeholder="Enter your password"
                        required
                      />
                    </label>
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant text-secondary focus:ring-secondary-container"
                        />
                        Remember me
                      </label>
                      <button
                        type="button"
                        className="font-label-sm text-label-sm text-secondary hover:text-secondary-container"
                        onClick={() => notify('Password recovery is not available in demo mode.', 'info')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <button
                      className="w-full rounded-lg bg-secondary text-on-secondary px-6 py-3.5 font-label-md text-label-md shadow-sm hover:bg-secondary-container transition-colors disabled:opacity-50"
                      type="submit"
                      disabled={loginForm.isSubmitting}
                    >
                      {loginForm.isSubmitting ? "Signing In..." : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
                    <p className="text-body-sm text-on-surface-variant">
                      No account yet?
                    </p>
                    <button
                      className="inline-flex mt-3 rounded-lg border border-outline-variant px-6 py-3 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                      onClick={() => {
                        setMode("signup");
                        setError("");
                      }}
                    >
                      Create account
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-3">
                      Sign Up
                    </p>
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
                      Create your profile
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Set up your secure account in a few steps.
                    </p>
                  </div>

                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      signupForm.handleSubmit(e);
                    }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                          First name
                        </span>
                        <input
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                          type="text"
                          name="firstName"
                          value={signupForm.values.firstName}
                          onChange={signupForm.handleChange}
                          onBlur={signupForm.handleBlur}
                          placeholder="John"
                          required
                        />
                      </label>
                      <label className="block">
                        <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                          Last name
                        </span>
                        <input
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                          type="text"
                          name="lastName"
                          value={signupForm.values.lastName}
                          onChange={signupForm.handleChange}
                          onBlur={signupForm.handleBlur}
                          placeholder="Smith"
                          required
                        />
                      </label>
                    </div>
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Email address
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="email"
                        name="email"
                        value={signupForm.values.email}
                        onChange={signupForm.handleChange}
                        onBlur={signupForm.handleBlur}
                        placeholder="you@example.com"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Phone (optional)
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="tel"
                        name="phone"
                        value={signupForm.values.phone}
                        onChange={signupForm.handleChange}
                        onBlur={signupForm.handleBlur}
                        placeholder="+27 00 000 0000"
                      />
                    </label>
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Password
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="password"
                        name="password"
                        value={signupForm.values.password}
                        onChange={signupForm.handleChange}
                        onBlur={signupForm.handleBlur}
                        placeholder="Create a password"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
                        Confirm password
                      </span>
                      <input
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container focus:border-secondary-container"
                        type="password"
                        name="confirmPassword"
                        value={signupForm.values.confirmPassword}
                        onChange={signupForm.handleChange}
                        onBlur={signupForm.handleBlur}
                        placeholder="Confirm your password"
                        required
                      />
                    </label>
                    <label className="flex items-start gap-3 text-body-sm text-on-surface-variant">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-outline-variant text-secondary focus:ring-secondary-container"
                        required
                      />
                      <span>
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-secondary hover:text-secondary-container"
                          onClick={() => notify('Terms and privacy policy are available in the full product docs.', 'info')}
                        >
                          terms
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-secondary hover:text-secondary-container"
                          onClick={() => notify('Terms and privacy policy are available in the full product docs.', 'info')}
                        >
                          privacy policy
                        </button>
                        .
                      </span>
                    </label>
                    <button
                      className="w-full rounded-lg bg-secondary text-on-secondary px-6 py-3.5 font-label-md text-label-md shadow-sm hover:bg-secondary-container transition-colors disabled:opacity-50"
                      type="submit"
                      disabled={signupForm.isSubmitting}
                    >
                      {signupForm.isSubmitting
                        ? "Creating..."
                        : "Create account"}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
                    <p className="text-body-sm text-on-surface-variant">
                      Already have access?
                    </p>
                    <button
                      className="inline-flex mt-3 rounded-lg border border-outline-variant px-6 py-3 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                      onClick={() => {
                        setMode("login");
                        setError("");
                      }}
                    >
                      Sign in
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
