const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  glb: "model/gltf-binary",
};

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function resolveContentType(file: File, kind: "image" | "model"): string {
  if (file.type) return file.type;

  const ext = getFileExtension(file.name);
  if (ext && MIME_BY_EXTENSION[ext]) return MIME_BY_EXTENSION[ext];

  return kind === "model" ? "model/gltf-binary" : "application/octet-stream";
}

export function assertValidUploadFile(
  file: File | null | undefined,
  label: string
): asserts file is File {
  if (!file) {
    throw new Error(`${label} seçilmedi.`);
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error(
      `${label} boş veya geçersiz. Lütfen dosyayı yeniden seçin.`
    );
  }
}

/** Read file bytes explicitly — avoids Supabase "No content provided" with raw File objects. */
export async function readFileForUpload(file: File): Promise<Blob> {
  const buffer = await file.arrayBuffer();

  if (!buffer || buffer.byteLength === 0) {
    throw new Error(
      `"${file.name}" okunamadı. Dosya boş görünüyor.`
    );
  }

  return new Blob([buffer], {
    type: file.type || "application/octet-stream",
  });
}
