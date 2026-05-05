"use client";

import { useState, useRef } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import styles from "./LogoUpload.module.css";

interface LogoUploadProps {
  onFileSelect: (file: File | null) => void;
}

export function LogoUpload({ onFileSelect }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 1 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setPreview(null);
      onFileSelect(null);
      return;
    }

    // Size validation
    if (file.size > MAX_SIZE) {
      setError("Image size must be 1 MB or less");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Type validation
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select an image file (jpg, png, webp)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Pharmacy Logo</label>
      
      {!preview ? (
        <div 
          className={styles.dropzone}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.dropzoneContent}>
            <Upload size={24} className={styles.uploadIcon} />
            <div className={styles.textGroup}>
              <span className={styles.mainText}>Click to upload logo</span>
              <span className={styles.subText}>PNG, JPG or WEBP (Max 1 MB)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.previewContainer}>
          <img src={preview} alt="Logo preview" className={styles.previewImage} />
          <button 
            type="button" 
            className={styles.removeBtn}
            onClick={removeFile}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
