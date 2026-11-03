
"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Presentation,
  Eye,
  EyeOff,
  ArrowRight,
  Dna,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AccountType = "student" | "teacher";

type EducationLevel =
  | "junior_secondary"
  | "ordinary_level"
  | "advanced_level";

const gradeOptions: Record<EducationLevel, number[]> = {
  junior_secondary: [6, 7, 8, 9],
  ordinary_level: [10, 11],
  advanced_level: [12, 13],
};

const spores = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: `${3 + ((i * 5) % 6)}px`,
  delay: `${-((i * 1.7) % 14)}s`,
  duration: `${12 + ((i * 3) % 10)}s`,
}));

function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-blob blob-a" />
      <span className="ambient-blob blob-b" />
      {spores.map((s, i) => (
        <span
          key={i}
          className="spore"
          style={
            {
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-icon">
        <Dna size={25} />
      </span>
      <span>
        Morphiq<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

export default function SignupPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("student");
  const [educationLevel, setEducationLevel] =
    useState<EducationLevel | "">("");
  const [grade, setGrade] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [schoolName, setSchoolName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleAccountTypeChange(type: AccountType) {
    setAccountType(type);
    setErrorMessage("");

    if (type === "teacher") {
      setEducationLevel("");
      setGrade("");
    } else {
      setSchoolName("");
    }
  }

  function handleEducationLevelChange(value: EducationLevel) {
    setEducationLevel(value);
    setGrade("");
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    if (accountType === "student" && (!educationLevel || !grade)) {
      setErrorMessage("Please select your education level and grade.");
      return;
    }

    if (accountType === "teacher" && !schoolName.trim()) {
      setErrorMessage("Please enter your school or institution name.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/verify-email`,
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            education_level:
              accountType === "student" ? educationLevel : null,
            grade: accountType === "student" ? Number(grade) : null,
            preferred_language: preferredLanguage,
            school_name:
              accountType === "teacher" ? schoolName.trim() : null,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setSuccess(true);
      } else {
        throw new Error("Registration could not be completed.");
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="auth-page centered">
        <Ambient />

        <div className="auth-wrap narrow">
          <div className="auth-brand">
            <Brand />
          </div>

          <div className="auth-card center">
            <div className="auth-seal">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <p className="auth-kicker">ONE LAST STEP</p>
            <h1 className="auth-title">Check your email</h1>

            <p className="auth-sub">
              We've sent a verification link to{" "}
              <strong>{email}</strong>. Open the email and verify your
              account before signing in to Morphiq.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="auth-submit"
            >
              Go to Login <ArrowRight className="h-5 w-5" />
            </button>

            <p className="auth-fine">
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <Ambient />

      <div className="auth-wrap">
        <nav className="navbar auth-navbar">
          <Brand />

          <div className="nav-actions">
            <span className="login-link">Already a member?</span>
            <Link href="/login" className="nav-button">
              Sign in <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <div className="auth-heading">
          <div className="eyebrow">
            <Sparkles size={15} />
            <span>A new dimension of biology learning</span>
          </div>

          <p className="auth-kicker">START YOUR LEARNING JOURNEY</p>
          <h1 className="auth-title">Create your account.</h1>
          <p className="auth-sub">
            Join Morphiq and explore Biology beyond dimensions.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSignup} className="auth-form">
            <div>
              <label className="auth-label">
                I am registering as a
              </label>

              <div className="auth-types">
                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("student")}
                  className={`type-tile ${
                    accountType === "student" ? "active" : ""
                  }`}
                >
                  <GraduationCap className="tile-icon h-7 w-7" />
                  <strong>Student</strong>
                  <span>Learn and explore Biology</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAccountTypeChange("teacher")}
                  className={`type-tile ${
                    accountType === "teacher" ? "active" : ""
                  }`}
                >
                  <Presentation className="tile-icon h-7 w-7" />
                  <strong>Teacher</strong>
                  <span>Support Biology learning</span>
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Full name</label>
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="auth-input"
              />
            </div>

            <div>
              <label className="auth-label">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>

            {accountType === "student" && (
              <div className="auth-panel">
                <div>
                  <label className="auth-label">Education level</label>
                  <select
                    required
                    value={educationLevel}
                    onChange={(e) =>
                      handleEducationLevelChange(
                        e.target.value as EducationLevel
                      )
                    }
                    className="auth-select"
                  >
                    <option value="">Select your education level</option>
                    <option value="junior_secondary">
                      Junior Secondary
                    </option>
                    <option value="ordinary_level">
                      Ordinary Level (O/L)
                    </option>
                    <option value="advanced_level">
                      Advanced Level (A/L)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="auth-label">Grade</label>
                  <select
                    required
                    disabled={!educationLevel}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="auth-select"
                  >
                    <option value="">
                      {educationLevel
                        ? "Select your grade"
                        : "Select education level first"}
                    </option>

                    {educationLevel &&
                      gradeOptions[educationLevel].map((item) => (
                        <option key={item} value={item}>
                          Grade {item}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {accountType === "teacher" && (
              <div className="auth-panel">
                <div>
                  <label className="auth-label">
                    School or institution
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Enter your school or institution"
                    className="auth-input"
                  />
                  <p className="auth-note">
                    Teacher accounts require administrator verification
                    before teacher-specific privileges are enabled.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="auth-label">Preferred language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="auth-select"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (minimum 8 characters)"
                  className="auth-input has-toggle"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="auth-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="auth-label">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="auth-input"
              />
            </div>

            {errorMessage && (
              <div role="alert" className="auth-error">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? "Creating your account..." : "Create Account"}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>

        <p className="auth-fine">
          By creating an account, you agree to Morphiq's Terms of
          Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}
