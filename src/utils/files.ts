export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Only PDF, PNG, JPEG, and WEBP files are supported.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size must be 10 MB or smaller.";
  }

  return null;
}

export function formatFileSize(
  sizeInBytes: number
): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}