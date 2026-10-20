import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  validateFileMagicBytes,
} from "@/lib/upload-utils";

/**
 * POST /api/v1/uploads
 * Accepts multipart/form-data with a "file" field, validates file type, magic bytes,
 * size boundaries, sanitizes the filename, and stores safe attachments.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { data: null, error: { message: "No valid file uploaded." } },
        { status: 400 }
      );
    }

    const blob = file as Blob;
    const originalName = (file as { name?: string }).name || "document.pdf";
    const extension = path.extname(originalName).toLowerCase();

    // 1. Validate file extension against allowlist
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `File extension '${extension}' is not permitted. Allowed: .pdf, .docx, .doc, .txt, .zip, .png, .jpg`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate declared MIME type
    if (blob.type && !ALLOWED_MIME_TYPES.has(blob.type.toLowerCase())) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `MIME type '${blob.type}' is not allowed for academic uploads.`,
          },
        },
        { status: 400 }
      );
    }

    // 3. Validate file size constraints (max 15MB, non-empty)
    if (blob.size <= 0) {
      return NextResponse.json(
        { data: null, error: { message: "Uploaded file cannot be empty." } },
        { status: 400 }
      );
    }

    if (blob.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: `File size exceeds the 15MB limit (received ${(blob.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    // 4. Validate binary magic bytes to prevent spoofed file extensions
    const isMagicValid = validateFileMagicBytes(buffer, extension);
    if (!isMagicValid) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message:
              "File signature does not match its claimed file extension. Upload rejected.",
          },
        },
        { status: 400 }
      );
    }

    // 5. Sanitize filename to prevent path traversal or unsafe characters
    const sanitizedBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60);

    const safeBase = sanitizedBase.length > 0 ? sanitizedBase : "attachment";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${safeBase}-${uniqueId}${extension}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        data: {
          fileUrl,
          filename,
          sizeBytes: buffer.length,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { data: null, error: { message: "File upload failed." } },
      { status: 500 }
    );
  }
}
