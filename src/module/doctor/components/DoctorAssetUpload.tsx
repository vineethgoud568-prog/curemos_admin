'use client';

import { FileImage, FileText, ImageUp, RefreshCcw, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DoctorAssetUploadProps = {
  label: string;
  value: string | File;
  onChange: (value: string) => void;
  onFileSelect: (file: File) => void;
  accept: string;
  error?: string;
  description: string;
};

type PreviewState = {
  fileType: 'image' | 'pdf' | 'file' | 'text' | null;
  previewUrl: string | null;
  fileName: string;
};

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const getFileType = (value: string) => {
  const normalized = value.split('?')[0].toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp|svg|avif)$/.test(normalized)) return 'image';
  if (/\.pdf$/.test(normalized)) return 'pdf';

  return 'file';
};

export default function DoctorAssetUpload({
  label,
  value,
  onChange,
  onFileSelect,
  accept,
  error,
  description,
}: DoctorAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewState>({
    fileType: null,
    previewUrl: null,
    fileName: '',
  });

  useEffect(() => {
    if (!value) {
      setPreview({ fileType: null, previewUrl: null, fileName: '' });
      return;
    }

    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      const isUrl = isValidUrl(trimmedValue);

      setPreview({
        fileType: isUrl ? getFileType(trimmedValue) : 'text',
        previewUrl: isUrl && getFileType(trimmedValue) === 'image' ? trimmedValue : null,
        fileName: isUrl ? trimmedValue.split('/').pop() || label : trimmedValue,
      });
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    const isImage = value.type.startsWith('image/');

    setPreview({
      fileType: isImage ? 'image' : value.type === 'application/pdf' ? 'pdf' : 'file',
      previewUrl: isImage ? objectUrl : null,
      fileName: value.name,
    });

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [label, value]);

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 via-white to-slate-100',
          error ? 'border-destructive/60' : 'border-slate-200',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onFileSelect(file);
          }}
        />

        {preview.fileType ? (
          <div className="space-y-4 p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              {preview.fileType === 'image' && preview.previewUrl ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image
                    src={preview.previewUrl}
                    alt={label}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : preview.fileType === 'text' ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium break-words text-slate-900">
                    {preview.fileName}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    {preview.fileType === 'pdf' ? (
                      <FileText className="h-10 w-10" />
                    ) : (
                      <FileImage className="h-10 w-10" />
                    )}
                    <span className="text-xs font-medium uppercase">
                      {preview.fileType === 'pdf' ? 'PDF file' : 'Document file'}
                    </span>
                  </div>
                </div>
              )}
              {preview.fileType !== 'text' && (
                <p className="mt-3 text-sm font-medium break-all text-slate-700">
                  {preview.fileName}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => inputRef.current?.click()}
              >
                <RefreshCcw className="h-4 w-4" />
                Replace file
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="gap-2 text-rose-600"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full flex-col items-center justify-center px-6 py-10 text-center"
            onClick={() => inputRef.current?.click()}
          >
            <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              {label.toLowerCase().includes('avatar') ? (
                <ImageUp className="h-6 w-6" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900">Upload {label.toLowerCase()}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>
          </button>
        )}
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  );
}
