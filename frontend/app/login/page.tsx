
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Dna,
  Loader2,
  LogIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        if (loginError.message.toLowerCase().includes("email not confirmed")) {
          setError(
            "Your email address has not been verified yet. Please check your inbox and verify your email."
          );
        } else if (
          loginError.message.toLowerCase().includes("invalid login credentials")
        ) {
          setError("Incorrect email address or password.");
        } else {
          setError(loginError.message);
        }

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-wrap narrow">

        {/* Brand */}
        <Link href="/" className="brand auth-brand">
          <span className="brand-mark">
            <Dna size={22} />
          </span>
          <span className="brand-name">
            Morphiq<span>.</span>
          </span>
        </Link>

        {/* Login card */}
        <section className="auth-card">

          <div className="auth-heading">
            <span className="auth-eyebrow">
              <LogIn size={14} />
              WELCOME BACK
            </span>

            <h1 className="auth-title">
              Continue your <span>exploration.</span>
            </h1>

            <p className="auth-description">
              Sign in to Morphiq and continue discovering biology
              beyond dimensions.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email address
              </label>

              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password" className="auth-label">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="auth-forgot"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="auth-password-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Morphiq
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span>NEW TO MORPHIQ?</span>
          </div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link href="/signup" className="auth-link">
              Create an account
            </Link>
          </p>

        </section>

        <p className="auth-footer">
          Explore Biology Beyond Dimensions.
        </p>

      </div>
    </main>
  );
}
