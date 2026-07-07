'use client';

import { Icon } from '@iconify-icon/react';
import { ImageUp, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  getAcceptString,
  getReadableExtensions,
  getReadableSize,
} from '@/lib/functions/file-input.lib';
import { validateUploadFile } from '@/lib/functions/upload.lib';
import { cn } from '@/lib/utils';
import { TCommonSchema } from '@/types/common/common.schema';

type TMediaItem = File | string;
type TMediaValue = TMediaItem | TMediaItem[] | null;

type PreviewItem = {
  key: string;
  url: string;
};

interface MediaUploaderProps {
  label: string;
  value: TMediaValue;
  onChange: (value: TMediaItem[]) => void;
  error?: string;
  description?: string;
  acceptedTypes?: TCommonSchema['media'][];
  maxSize?: number;
  maxFiles?: number;
  className?: string;
}

export function MediaUploader({
  label,
  value,
  onChange,
  error,
  description,
  acceptedTypes = ['image'],
  maxSize = 5 * 1024 * 1024,
  maxFiles = 1,
  className,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  const accept = useMemo(() => getAcceptString(acceptedTypes), [acceptedTypes]);
  const readableExtensions = useMemo(() => getReadableExtensions(acceptedTypes), [acceptedTypes]);
  const normalizedValue = useMemo<TMediaItem[]>(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const isImageFile = (item?: TMediaItem) => {
    if (!item) return false;

    if (typeof item === 'string') {
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item);
    }

    return item.type?.startsWith('image/');
  };

  useEffect(() => {
    const objectUrls: string[] = [];
    const nextPreviewItems = normalizedValue.map((item, index) => {
      if (typeof item === 'string') {
        return {
          key: `string-${index}-${item}`,
          url: item,
        };
      }

      const objectUrl = URL.createObjectURL(item);
      objectUrls.push(objectUrl);

      return {
        key: `file-${index}-${item.name}-${item.size}`,
        url: objectUrl,
      };
    });

    setPreviewItems(nextPreviewItems);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [normalizedValue]);

  const handleFileSelect = (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);
    if (!selectedFiles.length) return;

    const existingNames = new Set(
      normalizedValue.map((item) => (item instanceof File ? item.name : item)).filter(Boolean),
    );
    const nextFiles = [...normalizedValue];

    for (const file of selectedFiles) {
      const { validFile, errorMessage } = validateUploadFile(
        file,
        accept,
        maxSize,
        existingNames,
        maxFiles,
      );

      if (!validFile) {
        toast.error(errorMessage || 'Invalid file selected');
        continue;
      }

      if (nextFiles.length >= maxFiles) {
        toast.error(`You can only upload up to ${maxFiles} files`);
        break;
      }

      nextFiles.push(validFile);
      existingNames.add(validFile.name);
    }

    onChange(nextFiles);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(normalizedValue.filter((_, index) => index !== indexToRemove));
  };

  const hasPreview = previewItems.length > 0;
  const canAddMore = normalizedValue.length < maxFiles;

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        multiple={maxFiles > 1}
        onChange={(event) => {
          if (event.target.files) {
            handleFileSelect(event.target.files);
          }
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">
            {description ||
              `Accepted: ${readableExtensions}. Max size ${getReadableSize(maxSize)}. Up to ${maxFiles} files.`}
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {normalizedValue.length}/{maxFiles} selected
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (canAddMore) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (canAddMore) {
              inputRef.current?.click();
            }
          }
        }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-dashed bg-linear-to-br from-slate-50 via-white to-slate-100 transition-all',
          error
            ? 'border-destructive/60 ring-destructive/20 ring-1'
            : 'hover:border-primary/40 border-slate-200 hover:shadow-sm',
          'cursor-pointer',
        )}
      >
        {hasPreview ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {previewItems.map((item, index) => {
              const originalItem = normalizedValue[index];

              if (!originalItem) return null;

              const isImage = isImageFile(originalItem);

              return (
                <div
                  key={item.key}
                  className="group/item relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  {isImage ? (
                    <div className="relative aspect-16/10 w-full">
                      <Image
                        fill
                        unoptimized
                        src={item.url}
                        alt={`${label} ${index + 1}`}
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="h-full w-full object-cover transition duration-300 group-hover/item:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-16/10 flex-col items-center justify-center gap-2 p-4 text-center">
                      <Icon icon="mdi:file-document-outline" className="h-12 w-12 text-slate-500" />

                      <p className="max-w-full truncate text-sm font-medium text-slate-700">
                        {typeof originalItem === 'string'
                          ? originalItem.split('/').pop()
                          : originalItem.name}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/75 text-white transition hover:bg-slate-950"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemove(index);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex aspect-28/10 w-full flex-col items-center justify-center px-6 text-center">
            <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <ImageUp className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Upload {label.toLowerCase()}</p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Drag and drop is coming later. For now, click to browse and upload a file.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <Icon icon="mdi:file-image-outline" className="h-4 w-4" />
              <span>{readableExtensions}</span>
              <span className="text-slate-300">|</span>
              <span>Up to {getReadableSize(maxSize)}</span>
              <span className="text-slate-300">|</span>
              <span>{maxFiles} files max</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  );
}
