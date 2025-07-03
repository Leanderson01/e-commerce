"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import Image from "next/image";

interface ImageDropzoneProps {
  multiple?: boolean;
  onImagesChange?: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
  initialImageUrl?: string;
}

export function ImageDropzone({
  multiple = false,
  onImagesChange,
  maxFiles = 10,
  className,
  initialImageUrl,
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hasInitialImage, setHasInitialImage] = useState(!!initialImageUrl);

  // Initialize with existing image if provided
  useEffect(() => {
    if (initialImageUrl && hasInitialImage) {
      setPreviews([initialImageUrl]);
    }
  }, [initialImageUrl, hasInitialImage]);

  const handleFiles = useCallback(
    (files: FileList) => {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      let newImages: File[];
      let newPreviews: string[];

      if (multiple) {
        // Multiple mode: add to existing images
        const remainingSlots = maxFiles - selectedImages.length;
        const filesToAdd = imageFiles.slice(0, remainingSlots);
        newImages = [...selectedImages, ...filesToAdd];

        const previewsToAdd = filesToAdd.map((file) =>
          URL.createObjectURL(file),
        );
        newPreviews = [...previews, ...previewsToAdd];
      } else {
        // Single mode: replace existing image
        if (previews.length > 0 && !hasInitialImage) {
          previews.forEach((preview) => URL.revokeObjectURL(preview));
        }
        newImages = imageFiles.slice(0, 1);
        newPreviews = newImages.map((file) => URL.createObjectURL(file));
        setHasInitialImage(false); // Clear initial image flag when new file is selected
      }

      setSelectedImages(newImages);
      setPreviews(newPreviews);
      onImagesChange?.(newImages);
    },
    [
      selectedImages,
      previews,
      multiple,
      maxFiles,
      onImagesChange,
      hasInitialImage,
    ],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = selectedImages.filter((_, i) => i !== index);
      const newPreviews = previews.filter((_, i) => i !== index);

      // Revoke the URL to free memory (only for blob URLs, not initial image URLs)
      if (previews[index] && !hasInitialImage) {
        URL.revokeObjectURL(previews[index]);
      }

      // If removing the initial image, clear the flag
      if (index === 0 && hasInitialImage) {
        setHasInitialImage(false);
      }

      setSelectedImages(newImages);
      setPreviews(newPreviews);
      onImagesChange?.(newImages);
    },
    [selectedImages, previews, onImagesChange, hasInitialImage],
  );

  const clearAll = useCallback(() => {
    // Only revoke blob URLs, not initial image URLs
    previews.forEach((preview) => {
      if (!hasInitialImage || preview !== initialImageUrl) {
        URL.revokeObjectURL(preview);
      }
    });
    setSelectedImages([]);
    setPreviews([]);
    setHasInitialImage(false);
    onImagesChange?.([]);
  }, [previews, onImagesChange, hasInitialImage, initialImageUrl]);

  return (
    <div className={cn("w-full", className)}>
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          "bg-white",
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              isDragOver
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600",
            )}
          >
            <Upload className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              Upload {multiple ? "images" : "image"}
            </h3>
            <p className="text-sm text-gray-500">
              Click here or drag and drop to upload
            </p>
            <p className="text-xs text-gray-400">
              {multiple
                ? `PNG, JPG, GIF up to 10MB each (max ${maxFiles} files)`
                : "PNG, JPG, GIF up to 10MB"}
            </p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected{" "}
              {multiple
                ? `Images (${previews.length})`
                : previews.length > 0
                  ? "Image"
                  : ""}
            </h4>
            {((multiple && previews.length > 1) ||
              (!multiple && previews.length > 0)) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="bg-transparent text-xs"
              >
                Clear {multiple ? "All" : ""}
              </Button>
            )}
          </div>

          <div
            className={cn(
              "grid gap-4",
              multiple
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                : "mx-auto max-w-xs grid-cols-1",
            )}
          >
            {previews.map((preview, index) => (
              <div key={index} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
                  <Image
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="absolute right-1 bottom-1 left-1">
                  <div className="truncate rounded bg-black/50 px-2 py-1 text-xs text-white">
                    {hasInitialImage && index === 0
                      ? "Current banner"
                      : selectedImages[index]?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
