
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Dna,
  Loader2,
  Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-wrap narrow">

        <Link href="/" className="brand auth-brand">
          <span className="brand-mark">
            <Dna size={22} />
          </span>
          <span className="brand-name">
            Morphiq<span>.</span>
          </span>
        </Link>

        <section className="auth-card">

          {success ? (
            <div className="auth-success-state">
              <div className="auth-success-icon">
                <CheckCircle2 size={38} />
              </div>

              <h1 className="auth-title">
                Check your <span>inbox.</span>
              </h1>

              <p className="auth-description">
                If an account exists for <strong>{email}</strong>,
                you will receive a password reset link. Please check
                your inbox and follow the instructions.
              </p>

              <Link href="/login" className="auth-submit auth-submit-link">
                Back to login
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span className="auth-eyebrow">
                  <Mail size={14} />
                  ACCOUNT RECOVERY
                </span>

                <h1 className="auth-title">
                  Forgot your <span>password?</span>
                </h1>

                <p className="auth-description">
                  No worries. Enter the email address associated
                  with your Morphiq account and we'll send you a
                  password reset link.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>
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

                {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="auth-switch">
                <Link href="/login" className="auth-link">
                  <ArrowLeft size={15} />
                  Back to login
                </Link>
              </p>
            </>
          )}

        </section>

        <p className="auth-footer">
          Explore Biology Beyond Dimensions.
        </p>
      </div>
    </main>
  );
}
