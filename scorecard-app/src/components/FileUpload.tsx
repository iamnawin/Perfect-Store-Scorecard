import React, { useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import type { UploadedFile } from '../types'

interface FileUploadProps {
  label: string
  accept?: string
  multiple?: boolean
  value?: UploadedFile | UploadedFile[] | null
  onChange: (files: File[]) => void
  onRemove: (fileId: string) => void
  previewEnabled?: boolean
  className?: string
}

export function FileUpload({
  label,
  accept = 'image/*,application/pdf',
  multiple = false,
  value,
  onChange,
  onRemove,
  previewEnabled = true,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onChange(files)
    }
    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = ''
  }

  const files = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-[#014486]">{label}</label>
      
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative flex items-center gap-3 rounded-lg border border-[#c9d8ea] bg-white p-3 transition-colors hover:border-[#0176d3]"
          >
            {previewEnabled && file.fileType.startsWith('image/') ? (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[#c9d8ea]">
                <img
                  src={file.localPreviewUrl}
                  alt={file.fileName}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#c9d8ea] bg-[#f8fbfe] text-[#014486]">
                {file.fileType.includes('pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-[#014486]">{file.fileName}</p>
                <span className="shrink-0 rounded bg-[#edf7ee] border border-[#cde8d3] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1f5f33]">
                  {file.source === 'Map' ? 'Map Uploaded' : 'Evidence Added'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#4b5563]">
                <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                <span className="h-1 w-1 rounded-full bg-[#c9d8ea]" />
                <span>{file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                <span className="h-1 w-1 rounded-full bg-[#c9d8ea]" />
                <span>Uploaded {new Date(file.uploadedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            </div>

            <button
              onClick={() => onRemove(file.id)}
              className="rounded-full p-1.5 text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#dc2626]"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {(multiple || files.length === 0) && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c9d8ea] bg-[#f8fbfe] py-6 text-[#014486] transition-colors hover:border-[#0176d3] hover:bg-[#edf4ff]"
          >
            <div className="rounded-full bg-white p-2 shadow-sm">
              <Upload size={20} className="text-[#0176d3]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Click to upload</p>
              <p className="text-xs text-[#4b5563]">Images or PDFs up to 10MB</p>
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
