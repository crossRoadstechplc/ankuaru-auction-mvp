import Image from "next/image";
import { useState } from "react";

/**
 * Utility functions for handling images with fallbacks
 */

/**
 * Gets image URL with fallback to static image
 * @param imageUrl - The original image URL
 * @param fallbackPath - Fallback image path (defaults to /static.jpg)
 * @returns Image URL with fallback handling
 */
export function getImageWithFallback(
  imageUrl?: string,
  fallbackPath = "/static.jpg",
): string {
  if (!imageUrl || imageUrl.trim() === "") {
    return fallbackPath;
  }

  // If it's already a relative path starting with /, return as is
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // For external URLs, we'll use them directly but could add error handling
  return imageUrl;
}

/**
 * Image component with built-in fallback handling
 */
export function SafeImage({
  src,
  alt,
  className,
  fallback = "/static.jpg",
  ...props
}: {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
  [key: string]: any;
}) {
  const [imgSrc, setImgSrc] = useState(getImageWithFallback(src, fallback));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
