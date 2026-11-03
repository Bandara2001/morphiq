
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Microscope,
  Play,
  Settings,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/dashboard/LogoutButton";

async function DashboardContent() {

  await connection();


  const supabase = await createClient();

  // Check whether the user is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Retrieve the user's profile from Supabase.
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, account_type, education_level, grade, preferred_language, school_name, teacher_status"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-empty">
          <h1>Profile not found</h1>
          <p>
            We couldn't find your Morphiq profile. Please contact
            support or sign out and try again.
          </p>
          <LogoutButton />
        </div>
      </main>
    );
  }

  const isTeacher = profile.account_type === "teacher";
  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] || "Explorer";

  const educationLabel = {
    junior_secondary: "Junior Secondary",
    ordinary_level: "Ordinary Level",
    advanced_level: "Advanced Level",
  }[profile.education_level as string] || "Student";

  return (
    <main className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <Link href="/" className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <Microscope size={23} />
          </span>
          <span>
            Morphiq<span className="dashboard-brand-dot">.</span>
          </span>
        </Link>

        <div className="dashboard-nav-label">WORKSPACE</div>

        <nav className="dashboard-nav">
          <a href="#overview" className="dashboard-nav-item active">
            <LayoutDashboard size={18} />
            Overview
          </a>

          <a href="#learning" className="dashboard-nav-item">
            <BookOpen size={18} />
            {isTeacher ? "Teaching resources" : "My learning"}
          </a>

          <a href="#explore" className="dashboard-nav-item">
            <Microscope size={18} />
            Explore Biology
          </a>

          <a href="#tools" className="dashboard-nav-item">
            <BrainCircuit size={18} />
            AI learning tools
          </a>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <a href="#account" className="dashboard-nav-item">
            <Settings size={18} />
            Account
          </a>

          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <section className="dashboard-main">

        {/* Top bar */}
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">
              WORKSPACE / OVERVIEW
            </span>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>

            <div className="dashboard-user-info">
              <strong>{profile.full_name || "Morphiq User"}</strong>
              <span>{isTeacher ? "Teacher" : "Student"}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content" id="overview">

          {/* Welcome section */}
          <section className="dashboard-welcome">
            <div className="dashboard-welcome-content">
              <span className="dashboard-eyebrow">
                <Sparkles size={14} />
                YOUR BIOLOGY LEARNING SPACE
              </span>

              <h1>
                Welcome back, <span>{firstName}.</span>
              </h1>

              <p>
                {isTeacher
                  ? "Your teaching and biology resource workspace is ready."
                  : "Ready to explore the fascinating world of biology beyond dimensions?"}
              </p>

              <div className="dashboard-profile-tags">
                <span>
                  {isTeacher
                    ? "TEACHER ACCOUNT"
                    : `GRADE ${profile.grade || "N/A"}`}
                </span>

                {!isTeacher && <span>{educationLabel.toUpperCase()}</span>}

                <span>
                  {profile.preferred_language === "si"
                    ? "SINHALA"
                    : profile.preferred_language === "ta"
                      ? "TAMIL"
                      : "ENGLISH"}
                </span>
              </div>
            </div>

            <div className="dashboard-welcome-art">
              <div className="dashboard-orbit orbit-one" />
              <div className="dashboard-orbit orbit-two" />
              <div className="dashboard-orbit orbit-three" />
              <div className="dashboard-art-icon">
                <Microscope size={70} strokeWidth={1.1} />
              </div>
              <span className="dashboard-art-dot dot-one" />
              <span className="dashboard-art-dot dot-two" />
              <span className="dashboard-art-dot dot-three" />
            </div>
          </section>

          {/* Teacher approval notice */}
          {isTeacher && profile.teacher_status !== "approved" && (
            <section className="dashboard-notice">
              <div className="dashboard-notice-icon">
                <Activity size={20} />
              </div>

              <div>
                <strong>
                  Teacher account: {profile.teacher_status || "pending"}
                </strong>
                <p>
                  Your teacher account is awaiting approval. Some
                  teaching features will become available after approval.
                </p>
              </div>
            </section>
          )}

          {/* Overview cards */}
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-kicker">OVERVIEW</span>
                <h2>Your workspace</h2>
              </div>
            </div>

            <div className="dashboard-stat-grid">
              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon mint">
                  <BookOpen size={21} />
                </div>
                <span>Learning resources</span>
                <strong>Coming soon</strong>
                <small>Build your biology library</small>
              </article>

              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon purple">
                  <Microscope size={21} />
                </div>
                <span>3D models explored</span>
                <strong>Coming soon</strong>
                <small>Discover biological structures</small>
              </article>

              <article className="dashboard-stat-card">
                <div className="dashboard-stat-icon pink">
                  {isTeacher ? <Users size={21} /> : <Activity size={21} />}
                </div>
                <span>{isTeacher ? "Students" : "Learning progress"}</span>
                <strong>Coming soon</strong>
                <small>
                  {isTeacher
                    ? "Manage your learning community"
                    : "Track your learning journey"}
                </small>
              </article>
            </div>
          </section>

          {/* Learning area */}
          <section className="dashboard-section" id="learning">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-kicker">
                  {isTeacher ? "TEACHING SPACE" : "PICK UP WHERE YOU LEFT OFF"}
                </span>
                <h2>
                  {isTeacher ? "Your teaching workspace" : "Continue learning"}
                </h2>
              </div>
            </div>

            <div className="dashboard-feature-card">
              <div className="dashboard-feature-icon">
                {isTeacher ? (
                  <GraduationCap size={30} />
                ) : (
                  <Play size={30} />
                )}
              </div>

              <div className="dashboard-feature-text">
                <h3>
                  {isTeacher
                    ? "Prepare your biology resources"
                    : "Your next discovery starts here"}
                </h3>

                <p>
                  {isTeacher
                    ? "Organise biology materials and prepare interactive learning experiences for students."
                    : "Explore biological structures in 3D and understand how they work through interactive learning."}
                </p>
              </div>

              <span className="dashboard-coming-soon">
                COMING SOON
              </span>
            </div>
          </section>

          {/* Explore section */}
          <section className="dashboard-section" id="explore">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-kicker">
                  EXPLORE MORPHIQ
                </span>
                <h2>Discover biology</h2>
              </div>
            </div>

            <div className="dashboard-explore-grid">
              <Link
                href="/library"
                className="dashboard-explore-card group cursor-pointer"
              >
                <div className="dashboard-explore-icon mint">
                  <Microscope size={24} />
                </div>

                <h3>3D Biology Library</h3>

                <p>
                  Explore human, plant, animal and cellular structures
                  through interactive 3D models.
                </p>

                <span className="flex items-center gap-2">
                  EXPLORE LIBRARY
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>

              <article className="dashboard-explore-card">
                <div className="dashboard-explore-icon purple">
                  <BrainCircuit size={24} />
                </div>
                <h3>AI Biology Tutor</h3>
                <p>
                  Ask questions and receive explanations that help
                  you understand complex biology concepts.
                </p>
                <span>COMING SOON</span>
              </article>

              <article className="dashboard-explore-card">
                <div className="dashboard-explore-icon pink">
                  <Video size={24} />
                </div>
                <h3>Learning Resources</h3>
                <p>
                  Discover useful educational videos and supporting
                  biology materials.
                </p>
                <span>COMING SOON</span>
              </article>
            </div>
          </section>

          {/* Tools section */}
          <section className="dashboard-section" id="tools">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-section-kicker">YOUR ACCOUNT</span>
                <h2>Account information</h2>
              </div>
            </div>

            <div className="dashboard-account-card" id="account">
              <div className="dashboard-account-row">
                <span>Full name</span>
                <strong>{profile.full_name || "Not provided"}</strong>
              </div>

              <div className="dashboard-account-row">
                <span>Email address</span>
                <strong>{user.email}</strong>
              </div>

              <div className="dashboard-account-row">
                <span>Account type</span>
                <strong>{isTeacher ? "Teacher" : "Student"}</strong>
              </div>

              {isTeacher ? (
                <>
                  <div className="dashboard-account-row">
                    <span>School / Institution</span>
                    <strong>{profile.school_name || "Not provided"}</strong>
                  </div>

                  <div className="dashboard-account-row">
                    <span>Approval status</span>
                    <strong>{profile.teacher_status || "Pending"}</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="dashboard-account-row">
                    <span>Education level</span>
                    <strong>{educationLabel}</strong>
                  </div>

                  <div className="dashboard-account-row">
                    <span>Grade</span>
                    <strong>{profile.grade || "Not provided"}</strong>
                  </div>
                </>
              )}
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>MORPHIQ © 2026</span>
            <span>Explore Biology Beyond Dimensions.</span>
          </footer>

        </div>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-page">
          <div className="dashboard-main">
            <p>Loading your dashboard...</p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}