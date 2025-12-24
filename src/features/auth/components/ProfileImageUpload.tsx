"use client";

import { useRef, useState } from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  removeProfileImage,
  updateProfileImage,
} from "../services/auth.service";

const MAX_SIZE = 1 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data
      ?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
}

export function ProfileImageUpload({
  currentImage,
  userName,
}: {
  currentImage?: string | null;
  userName?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Image size must be 1 MB or less.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsLoading(true);

    try {
      const response = await updateProfileImage(file);
      setPreview(response.data?.image || objectUrl);
      toast.success("Profile image updated");
      window.location.reload();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update profile image"));
      setPreview(currentImage || null);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  }

  async function handleRemove() {
    if (!preview) return;
    setIsLoading(true);
    try {
      await removeProfileImage();
      setPreview(null);
      toast.success("Profile image removed");
      window.location.reload();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to remove profile image"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-4 text-(--color-text)">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-(--color-bg-secondary)">
        {preview ? (
          <img src={preview} alt={userName || "Profile"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-(--color-text-faint)">
            <Camera size={24} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-semibold text-(--color-text)">Profile image</div>
        <p className="text-sm text-(--color-text-muted)">JPG, PNG, or WEBP. Maximum 1 MB.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-(--color-primary-dark) px-3 py-2 text-sm font-semibold text-(--color-text-inverse) disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload size={15} />
            {isLoading ? "Uploading..." : "Replace image"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-(--color-border) px-3 py-2 text-sm font-semibold text-(--color-text) disabled:opacity-60"
            onClick={handleRemove}
            disabled={isLoading || !preview}
          >
            <Trash2 size={15} />
            Remove
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
