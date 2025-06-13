export interface Props {
  modelValue?: string | null;
  folder?: string;
  altText?: string;
  acceptedTypes?: string;
  maxFileSize?: number;
  showPreview?: boolean;
}

export interface Emits {
  (e: "update:modelValue", value: string | null): void;
  (e: "upload-success", data: { url: string; key: string }): void;
  (e: "upload-error", error: string): void;
  (e: "file-removed"): void;
  (e: "temp-file-uploaded", key: string): void;
  (e: "temp-file-cleaned"): void;
}
