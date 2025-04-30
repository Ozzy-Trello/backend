// src/utils/file_utils.ts

/**
 * Converts file size in bytes to appropriate unit (B, KB, MB, GB)
 * @param bytes File size in bytes
 * @returns Object containing size value and unit
 */
export function getFileSizeUnit(bytes: number): { size: number, unit: string } {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  // Round to 2 decimal places if not bytes
  if (unitIndex > 0) {
    size = Math.round(size * 100) / 100;
  }
  
  return {
    size,
    unit: units[unitIndex]
  };
}

/**
 * Generates a safe filename by removing problematic characters
 * @param filename Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove characters that could cause issues in file systems
  return filename.replace(/[^\w\s.-]/g, '_');
}

/**
 * Extracts file extension from filename
 * @param filename Original filename
 * @returns File extension (lowercase, without the dot)
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) {
    return '';
  }
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Checks if a file's MIME type is an image
 * @param mimeType File's MIME type
 * @returns Boolean indicating if the file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Checks if a file's MIME type is a document (PDF, Office docs, etc.)
 * @param mimeType File's MIME type
 * @returns Boolean indicating if the file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  return documentTypes.includes(mimeType);
}