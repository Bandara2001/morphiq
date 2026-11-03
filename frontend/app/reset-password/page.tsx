
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Dna,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          "Unable to reset your password. The reset link may have expired. Please request a new one."
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackToLogin() {
    await supabase.auth.signOut();
    router.replace("/login");
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
                Password <span>updated!</span>
              </h1>

              <p className="auth-description">
                Your Morphiq password has been changed successfully.
                You can now sign in using your new password.
              </p>

              <button
                type="button"
                className="auth-submit"
                onClick={handleBackToLogin}
              >
                Continue to login
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span className="auth-eyebrow">
                  <LockKeyhole size={14} />
                  PASSWORD RECOVERY
                </span>

                <h1 className="auth-title">
                  Create a new <span>password.</span>
                </h1>

                <p className="auth-description">
                  Choose a new password for your Morphiq account.
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit}>

                <div className="auth-field">
                  <label htmlFor="password" className="auth-label">
                    New password
                  </label>

                  <div className="auth-password-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword" className="auth-label">
                    Confirm new password
                  </label>

                  <div className="auth-password-wrap">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="Enter your new password again"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
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
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
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
