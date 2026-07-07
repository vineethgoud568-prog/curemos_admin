'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

export type FileInputProps = {
  className?: string;
  onFilesAccepted?: (files: File[]) => void;
  accept?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  multiple?: boolean;
};

export function FileInput({
  className,
  onFilesAccepted,
  accept = ['image/jpeg', 'image/png', 'image/gif'],
  maxFiles = 5,
  maxSize = 1024 * 1024 * 4, // 4MB
  multiple = true,
}: FileInputProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted?.(acceptedFiles);
    },
    [onFilesAccepted],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800',
        isDragActive && 'bg-gray-100 dark:bg-gray-700',
        className,
      )}
    >
      <input {...getInputProps()} />
      <p className='text-sm text-gray-500 dark:text-gray-400'>
        {isDragActive ? (
          'Drop the files here ...'
        ) : (
          <>
            <span className='font-semibold'>Click to upload</span> or drag and drop
            <br />
            SVG, PNG, JPG, or GIF (max {maxFiles} files)
          </>
        )}
      </p>
      {fileRejections.length > 0 && (
        <ul className='mt-2 text-sm text-red-500'>
          {fileRejections.map(({ file, errors }, i) => (
            <li key={i}>
              {file.name} - {errors.map(e => e.message).join(', ')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
