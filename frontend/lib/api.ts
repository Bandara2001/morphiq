const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface BiologyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: BiologyCategory[];
}

export async function getBiologyCategories(): Promise<BiologyCategory[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/categories/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve biology categories.");
  }

  const data: CategoriesResponse = await response.json();

  if (!data.success) {
    throw new Error("The categories API returned an unsuccessful response.");
  }

  return data.categories;
}