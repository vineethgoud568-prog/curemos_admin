'use client';

import { Icon } from '@iconify-icon/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FileUploadProps {
  form: UseFormReturn<any>;
  name: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ form, name }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // 🔥 Detect existing value (edit mode)
  useEffect(() => {
    const value = form.getValues(name);

    if (typeof value === 'string' && value) {
      setFileName(value.split('/').pop() || 'File');

      if (value.match(/\.(jpeg|jpg|png|webp)$/i)) {
        setFileType('image');
        setPreview(value);
      } else if (value.match(/\.pdf$/i)) {
        setFileType('application/pdf');
      } else if (value.match(/\.(doc|docx)$/i)) {
        setFileType('application/msword');
      } else {
        setFileType('file');
      }
    }
  }, [form, name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue(name, file, { shouldValidate: true });

    setFileType(file.type);
    setFileName(file.name);

    // Image preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const renderContent = () => {
    // Image preview
    if ((fileType?.startsWith('image') || fileType === 'image') && preview) {
      return <Image src={preview} alt="Preview" fill className="object-cover" />;
    }

    // PDF
    if (fileType === 'application/pdf') {
      return (
        <div className="flex h-full flex-col items-center justify-center text-red-500">
          <Icon icon="mdi:file-pdf-box" className="text-4xl" />
          <span className="mt-1 text-xs">PDF</span>
        </div>
      );
    }

    // DOC
    if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-blue-500">
          <Icon icon="mdi:file-word-box" className="text-4xl" />
          <span className="mt-1 truncate px-2 text-xs">DOC</span>
        </div>
      );
    }

    // Default
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <Icon icon="mdi:file" className="text-4xl" />
        <span className="mt-1 truncate px-2 text-xs">{fileName || 'Upload'}</span>
      </div>
    );
  };

  return (
    <div className="group relative mb-4">
      <div className="relative inline-block">
        <div className="border-primary/10 relative h-28 w-28 overflow-hidden rounded-xl border-2 bg-gray-50 shadow-md sm:h-32 sm:w-32">
          {renderContent()}
        </div>

        <label
          htmlFor={`upload-${name}`}
          className="bg-primary absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <Icon icon="lucide:upload" className="h-4 w-4" />
          <input
            id={`upload-${name}`}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleChange}
          />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;
