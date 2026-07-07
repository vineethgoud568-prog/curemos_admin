'use client';

import { Camera, Trash2, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | File | null;
  onChange: (value: File | string | null) => void;
  error?: string; // Still keep for external errors if needed, but we'll prioritize local selection errors
  label?: string;
  className?: string;
  placeholderIcon?: React.ReactNode;
  circle?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  initials?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  error: externalError,
  label,
  className,
  placeholderIcon,
  circle = true,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  initials,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
      setLocalError(null);
    } else if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > maxSize * 1024 * 1024) {
      const msg = `File size must be less than ${maxSize}MB`;
      toast.error(msg);
      setLocalError(msg);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      const msg = `Only ${acceptedTypes.map((t) => t.split('/')[1]).join(', ')} formats are supported.`;
      toast.error(msg);
      setLocalError(msg);
      return;
    }

    setLocalError(null);
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    setLocalError(null);
  };

  const activeError = localError || externalError;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="text-sm font-bold text-slate-700">{label}</p>}

      <div className="relative inline-block">
        <div
          className={cn(
            'group relative overflow-hidden bg-slate-50 transition-all ring-offset-2 focus-within:ring-2 focus-within:ring-primary',
            circle ? 'h-32 w-32 rounded-full' : 'h-40 w-full rounded-xl',
            activeError ? 'ring-2 ring-destructive' : 'ring-1 ring-slate-200 shadow-sm',
          )}
        >
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 font-bold text-slate-400">
              {initials ? (
                <span className={cn(circle ? 'text-3xl' : 'text-5xl')}>{initials}</span>
              ) : (
                placeholderIcon || <Building2 size={circle ? 48 : 64} />
              )}
            </div>
          )}

          {/* Hover Overlay */}
          <label
            htmlFor="image-upload"
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
          >
            <Camera size={24} className="mb-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase">
              {preview ? 'Change' : 'Upload'}
            </span>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept={acceptedTypes.join(',')}
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Remove Button */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-200 text-slate-500 shadow-md transition-all hover:bg-destructive hover:text-white hover:scale-110 active:scale-95"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {activeError && (
        <p className="animate-in fade-in slide-in-from-top-1 text-center text-xs font-medium text-destructive">
          {activeError}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
