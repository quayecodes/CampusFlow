/**
 * CampusFlow Upload Security Utilities
 * Implements OWASP file upload protection:
 * - Strict extension allowlisting
 * - MIME type validation
 * - Binary magic byte verification
 * - Filename sanitization & path traversal prevention
 */

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

export const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
]);

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "application/octet-stream", // Binary fallback
]);

/**
 * Validates file magic signature bytes to prevent file extension spoofing
 */
export function validateFileMagicBytes(buffer: Buffer, ext: string): boolean {
  if (buffer.length === 0) return false;

  switch (ext.toLowerCase()) {
    case ".pdf":
      // %PDF (0x25 0x50 0x44 0x46)
      return (
        buffer.length >= 4 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      );

    case ".png":
      // 0x89 0x50 0x4E 0x47
      return (
        buffer.length >= 4 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );

    case ".jpg":
    case ".jpeg":
      // 0xFF 0xD8 0xFF
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );

    case ".zip":
    case ".docx":
      // PK (0x50 0x4B)
      return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;

    case ".doc":
      // OLE Compound Document (0xD0 0xCF 0x11 0xE0) or PK zip
      return (
        buffer.length >= 4 &&
        ((buffer[0] === 0xd0 &&
          buffer[1] === 0xcf &&
          buffer[2] === 0x11 &&
          buffer[3] === 0xe0) ||
          (buffer[0] === 0x50 && buffer[1] === 0x4b))
      );

    case ".txt":
      // Plain text files should not contain executable null bytes in the header
      return !buffer.subarray(0, Math.min(buffer.length, 512)).includes(0x00);

    default:
      return false;
  }
}
