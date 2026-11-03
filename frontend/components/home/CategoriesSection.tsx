"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Sprout,
  PawPrint,
  Microscope,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getBiologyCategories,
  type BiologyCategory,
} from "@/lib/api";


const categoryIcons: Record<string, React.ElementType> = {
  heart: Heart,
  sprout: Sprout,
  "paw-print": PawPrint,
  microscope: Microscope,
};


export default function CategoriesSection() {
  const [categories, setCategories] = useState<BiologyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);

        const data = await getBiologyCategories();
        setCategories(data);
      } catch (err) {
        console.error("Category loading error:", err);
        setError("Unable to load biology categories. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className="morphiq-categories" id="explore">
      <div className="morphiq-categories-heading">
        <span className="section-eyebrow">EXPLORE BIOLOGY</span>

        <h2>
          Discover the <span>living world.</span>
        </h2>

        <p>
          Explore biological structures through interactive 3D learning
          experiences.
        </p>
      </div>

      {loading && (
        <div className="categories-state">
          <Loader2 className="animate-spin" size={25} />
          <p>Loading biology categories...</p>
        </div>
      )}

      {error && (
        <div className="categories-state categories-error">
          <AlertCircle size={22} />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="category-retry"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="categories-state">
          <p>No biology categories are available yet.</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="morphiq-category-grid">
          {categories.map((category) => {
            const Icon =
              categoryIcons[category.icon ?? ""] ?? Microscope;

            return (
              <article className="morphiq-category-card" key={category.id}>
                <div className="category-icon">
                  <Icon size={27} />
                </div>

                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>

                <span className="category-arrow">↗</span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}