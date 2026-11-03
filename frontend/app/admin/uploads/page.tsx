
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function AdminUploadsPage() {
  const [modelId, setModelId] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [materialFile, setMaterialFile] = useState<File | null>(null);

  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");

  async function uploadFile(endpoint: string, file: File) {
    setMessage("");

    try {
      setLoading(endpoint);

      // Retrieve the currently logged-in user's session.
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        throw new Error("Please log in before uploading files.");
      }

      const accessToken = data.session.access_token;

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail
            ? typeof result.detail === "string"
              ? result.detail
              : JSON.stringify(result.detail)
            : "Upload failed."
        );
      }

      setMessage(
        `Upload successful!\n${JSON.stringify(result, null, 2)}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    } finally {
      setLoading("");
    }
  }

  function uploadModel() {
    if (!modelId.trim()) {
      setMessage("Please enter the model ID.");
      return;
    }

    if (!modelFile) {
      setMessage("Please select a 3D model file.");
      return;
    }

    uploadFile(
      `/api/v1/uploads/models/${encodeURIComponent(modelId.trim())}/3d`,
      modelFile
    );
  }

  function uploadThumbnail() {
    if (!modelId.trim()) {
      setMessage("Please enter the model ID.");
      return;
    }

    if (!thumbnailFile) {
      setMessage("Please select a thumbnail image.");
      return;
    }

    uploadFile(
      `/api/v1/uploads/models/${encodeURIComponent(modelId.trim())}/thumbnail`,
      thumbnailFile
    );
  }

  function uploadMaterial() {
    if (!materialFile) {
      setMessage("Please select a learning material.");
      return;
    }

    uploadFile("/api/v1/uploads/learning-materials", materialFile);
  }

  return (
    <main className="min-h-screen bg-[#050a14] px-6 py-12 text-[#eef4ff]">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#4df2c8]">
            Morphiq Administration
          </p>
          <h1 className="text-3xl font-bold">File Uploads</h1>
          <p className="mt-2 text-[#8fa3bf]">
            Upload 3D biological models, thumbnails and learning materials.
          </p>
        </div>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0e182a] p-6">
          <h2 className="text-xl font-semibold">3D Model Upload</h2>

          <div>
            <label className="mb-2 block text-sm text-[#8fa3bf]">
              Biology Model ID
            </label>
            <input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="Enter the model UUID"
              className="w-full rounded-lg border border-white/10 bg-[#050a14] p-3 outline-none focus:border-[#4df2c8]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#8fa3bf]">
              Select 3D Model (.glb / .gltf)
            </label>
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={(e) => setModelFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-[#8fa3bf]"
            />
          </div>

          <button
            onClick={uploadModel}
            disabled={loading !== ""}
            className="rounded-lg bg-[#4df2c8] px-5 py-3 font-semibold text-[#050a14] disabled:opacity-50"
          >
            {loading.includes("/3d") ? "Uploading..." : "Upload 3D Model"}
          </button>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0e182a] p-6">
          <h2 className="text-xl font-semibold">Model Thumbnail</h2>

          <p className="text-sm text-[#8fa3bf]">
            Uses the same Biology Model ID entered above.
          </p>

          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[#8fa3bf]"
          />

          <button
            onClick={uploadThumbnail}
            disabled={loading !== ""}
            className="rounded-lg bg-[#8b7bff] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading.includes("/thumbnail")
              ? "Uploading..."
              : "Upload Thumbnail"}
          </button>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#0e182a] p-6">
          <h2 className="text-xl font-semibold">Learning Material</h2>

          <p className="text-sm text-[#8fa3bf]">
            Upload PDF, DOC, DOCX, PNG, JPG, JPEG or WEBP files.
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-[#8fa3bf]"
          />

          <button
            onClick={uploadMaterial}
            disabled={loading !== ""}
            className="rounded-lg bg-[#ff7ac6] px-5 py-3 font-semibold text-[#050a14] disabled:opacity-50"
          >
            {loading === "/api/v1/uploads/learning-materials"
              ? "Uploading..."
              : "Upload Learning Material"}
          </button>
        </section>

        {message && (
          <div className="whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-[#0e182a] p-4 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
