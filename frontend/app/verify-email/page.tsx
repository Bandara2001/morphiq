import type { CSSProperties } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const spores = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 41) % 100}%`,
  size: `${3 + ((i * 5) % 6)}px`,
  delay: `${-((i * 1.9) % 14)}s`,
  duration: `${13 + ((i * 3) % 10)}s`,
}));

export default function VerifyEmailPage() {
  return (
    <main className="auth-page centered">
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

      <div className="auth-wrap narrow">
        <div className="auth-card center">

          <div className="auth-seal">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <h1 className="auth-title">Email verified!</h1>

          <p className="auth-sub">
            Your Morphiq email address has been verified successfully.
            You can now sign in and start exploring Biology beyond dimensions.
          </p>

          <Link href="/login" className="auth-submit">
            Continue to Login
          </Link>

        </div>
      </div>
    </main>
  );
}