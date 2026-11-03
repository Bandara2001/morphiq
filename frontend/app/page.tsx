import type { CSSProperties } from "react";
import Link from "next/link";
import CategoriesSection from "@/components/home/CategoriesSection";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  Dna,
  HeartPulse,
  Leaf,
  Microscope,
  Sparkles,
  Upload,
} from "lucide-react";



const features = [
  {
    icon: Compass,
    title: "Interactive 3D Exploration",
    description:
      "Rotate, zoom and explore biological structures from every angle.",
  },
  {
    icon: Brain,
    title: "AI Biology Tutor",
    description:
      "Get clear explanations and answers to your biology questions.",
  },
  {
    icon: BookOpen,
    title: "Learn at Your Own Pace",
    description:
      "Save notes, revisit topics and build your understanding.",
  },
];

// Decorative floating "spores" (deterministic, so no hydration mismatch)
const spores = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: `${3 + ((i * 5) % 6)}px`,
  delay: `${-((i * 1.7) % 14)}s`,
  duration: `${12 + ((i * 3) % 10)}s`,
}));

export default function Home() {
  return (
    <main>
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

      <nav className="navbar">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Dna size={25} />
          </span>
          <span>Morphiq<span className="brand-dot">.</span></span>
        </Link>

        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link href="/login" className="login-link">Log in</Link>
          <Link href="/signup" className="nav-button">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="hero" id="about">
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles size={15} />
            <span>A new dimension of biology learning</span>
          </div>

          <h1>
            Biology is better
            <br />
            when you can <span>explore it.</span>
          </h1>

          <p className="hero-description">
            Go beyond textbooks. Discover the hidden structures of life
            through interactive 3D models, intelligent learning and
            exploration.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="primary-button">
             Start exploring <ArrowRight size={18} />
             </Link>
            <a href="#features" className="secondary-button">
              Discover Morphiq
            </a>
          </div>

          <div className="hero-note">
            <CheckCircle2 size={16} />
            <span>Designed for curious biology students</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-grid" />
          <div className="visual-glow" />
          <div className="visual-orbit orbit-one">
            <span className="orbit-node" />
          </div>
          <div className="visual-orbit orbit-two">
            <span className="orbit-node" />
            <span className="orbit-node node-alt" />
          </div>

          <div className="visual-center">
            <span className="scan-line" />
            <Dna size={112} strokeWidth={1.1} />
          </div>

          <div className="floating-card card-top">
            <HeartPulse size={19} />
            <div>
              <strong>Human Biology</strong>
              <span>Explore the human body</span>
            </div>
          </div>

          <div className="floating-card card-bottom">
            <Brain size={19} />
            <div>
              <strong>Learn differently</strong>
              <span>Visualise. Understand. Remember.</span>
            </div>
          </div>

          <span className="visual-label label-one">STRUCTURE</span>
          <span className="visual-label label-two">DISCOVERY</span>
        </div>
      </section>

      <CategoriesSection />

      <section className="features-section" id="features">
        <div className="features-intro">
          <span className="section-kicker">LEARNING REIMAGINED</span>
          <h2>More than just a biology textbook.</h2>
          <p>
            Everything you need to understand, visualise and explore
            biological concepts in one learning space.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">
                  <Icon size={23} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="upload-banner">
        <div className="upload-icon">
          <Upload size={25} />
        </div>
        <div>
          <span className="section-kicker">A SMARTER WAY TO STUDY</span>
          <h2>Bring your biology materials.</h2>
          <p>
            Upload your learning materials and discover relevant
            biological structures. This feature is coming soon.
          </p>
        </div>
        <a href="#about" className="secondary-button">
          Coming soon
        </a>
      </section>

      <footer className="footer">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Dna size={21} />
          </span>
          <span>Morphiq<span className="brand-dot">.</span></span>
        </Link>
        <p>Explore Biology Beyond Dimensions.</p>
        <span className="copyright">© 2026 Morphiq. All rights reserved.</span>
      </footer>
    </main>
  );
}