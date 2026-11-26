"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";
import { Button } from "../../core/button";
import { Spinner } from "../../core/spinner";
import { UploadArea } from "../upload-area";
import { FileThumbnail } from "../file-thumbnail";

export type ImagePickerImage = { id: string; url: string; alt?: string };

export interface ImagePickerProps {
  value: ImagePickerImage[];
  onChange: (next: ImagePickerImage[]) => void;
  /** Com galeria, dá para escolher nela; com `max` 1 a escolha substitui. */
  gallery?: ImagePickerImage[];
  /** O consumidor envia o arquivo e devolve a imagem. */
  onUpload: (file: File) => Promise<ImagePickerImage>;
  max?: number;
  accept?: string;
  maxSizeBytes?: number;
  sizeErrorMessage?: string;
  typeErrorMessage?: string;
  uploadErrorMessage?: string;
  label?: string;
  description?: string;
  galleryLabel?: string;
  uploadLabel?: string;
  removeLabel?: string;
  uploadingLabel?: string;
  /** Miniaturas 12:5 (`cover`) ou 1:1 (`square`). */
  aspect?: "cover" | "square";
  disabled?: boolean;
  error?: string;
  className?: string;
}

// Aceita extensão (.png), tipo exato (image/png) e curinga (image/*).
function typeAllowed(file: File, accept: string) {
  return accept.split(",").some((raw) => {
    const a = raw.trim().toLowerCase();
    if (!a) return false;
    if (a.startsWith(".")) return file.name.toLowerCase().endsWith(a);
    if (a.endsWith("/*")) return file.type.toLowerCase().startsWith(a.slice(0, -1));
    return file.type.toLowerCase() === a;
  });
}

export function ImagePicker({
  value,
  onChange,
  gallery,
  onUpload,
  max = 1,
  accept = "image/jpeg,image/png",
  maxSizeBytes,
  sizeErrorMessage = "A imagem excede o tamanho máximo permitido.",
  typeErrorMessage = "Formato de imagem não aceito.",
  uploadErrorMessage = "Não foi possível enviar a imagem. Tente novamente.",
  label,
  description,
  galleryLabel = "Galeria",
  uploadLabel = "Enviar imagem",
  removeLabel = "Remover imagem",
  uploadingLabel = "Enviando…",
  aspect = "cover",
  disabled = false,
  error,
  className,
}: ImagePickerProps) {
  const [uploading, setUploading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string>();
  const labelId = React.useId();
  const errorId = React.useId();
  const shown = error ?? localError;
  const full = max > 1 && value.length >= max;

  const select = (img: ImagePickerImage) => {
    setLocalError(undefined);
    if (value.some((v) => v.id === img.id)) return onChange(value.filter((v) => v.id !== img.id));
    if (max === 1) return onChange([img]);
    if (value.length < max) onChange([...value, img]);
  };

  const upload = async (files: File[]) => {
    setLocalError(undefined);
    let current = value;
    setUploading(true);
    try {
      for (const file of files) {
        if (max > 1 && current.length >= max) break;
        if (!typeAllowed(file, accept)) return setLocalError(typeErrorMessage);
        if (maxSizeBytes !== undefined && file.size > maxSizeBytes) return setLocalError(sizeErrorMessage);
        try {
          const img = await onUpload(file);
          current = max === 1 ? [img] : [...current, img];
          onChange(current);
        } catch {
          return setLocalError(uploadErrorMessage);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const thumbClass = cn(
    aspect === "cover" ? "w-60 [&>span:first-child]:aspect-[12/5]" : "w-40 [&>span:first-child]:aspect-square",
  );

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={shown ? errorId : undefined}
      aria-busy={uploading || undefined}
      className={cn("flex flex-col gap-3", className)}
    >
      {label && (
        <p id={labelId} className="text-sm font-medium">
          {label}
        </p>
      )}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((img) => (
            <li key={img.id} className="relative">
              <FileThumbnail
                name={img.alt ?? img.id}
                mime="image/*"
                src={img.url}
                className={thumbClass}
                onOpen={() => window.open(img.url, "_blank", "noopener")}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                disabled={disabled}
                aria-label={`${removeLabel}: ${img.alt ?? img.id}`}
                onClick={() => onChange(value.filter((v) => v.id !== img.id))}
                className="absolute right-1 top-1 h-8 w-8"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {gallery && gallery.length > 0 && (
        <div role="group" aria-label={galleryLabel} className="flex flex-col gap-2">
          <p className="text-sm font-medium">{galleryLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {gallery.map((img) => {
              const on = value.some((v) => v.id === img.id);
              return (
                <li key={img.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={img.alt ?? img.id}
                    disabled={disabled || uploading || (!on && full)}
                    onClick={() => select(img)}
                    className={cn(
                      "block overflow-hidden rounded-md border-2 border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
                      aspect === "cover" ? "w-36" : "w-20",
                      on && "border-primary",
                    )}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className={cn("w-full object-cover", aspect === "cover" ? "aspect-[12/5]" : "aspect-square")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!full && (
        <UploadArea
          title={uploading ? uploadingLabel : uploadLabel}
          accept={accept}
          multiple={max > 1}
          disabled={disabled || uploading}
          icon={uploading ? <Spinner size="sm" aria-label={uploadingLabel} /> : undefined}
          onSelect={upload}
        />
      )}

      {shown && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {shown}
        </p>
      )}
    </div>
  );
}
