import { useState, useRef } from 'react';
import { SourceId, UploadError } from '@/types/ingestion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId: SourceId;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const getSourceUploadInfo = (sourceId: SourceId) => {
  const info = {
    maximo: { title: 'Maximo Job Cards', accept: '.csv,.json', maxSize: 10 },
    cert: { title: 'Fitness Certificates', accept: '.csv,.xlsx', maxSize: 10 },
    branding: { title: 'Branding Contracts', accept: '.csv,.json', maxSize: 10 },
    iot: { title: 'IoT Data', accept: '.csv,.json', maxSize: 50 },
    cleaning: { title: 'Cleaning Roster', accept: '.csv,.xlsx', maxSize: 5 },
    yard: { title: 'Yard Layout', accept: '.csv,.json', maxSize: 5 },
    overrides: { title: 'Manual Overrides', accept: '.csv,.json', maxSize: 2 },
  };
  return info[sourceId] || { title: 'Data Upload', accept: '.csv,.json,.xlsx', maxSize: 10 };
};

export const UploadModal = ({ isOpen, onClose, sourceId, onUpload, isUploading }: UploadModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<UploadError[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadInfo = getSourceUploadInfo(sourceId);

  const validateFile = (file: File): UploadError[] => {
    const errors: UploadError[] = [];
    
    // Check file size (MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > uploadInfo.maxSize) {
      errors.push({
        row: 0,
        field: 'file_size',
        message: `File size exceeds ${uploadInfo.maxSize}MB limit`,
        value: `${fileSizeMB.toFixed(2)}MB`
      });
    }

    // Check file extension
    const validExtensions = uploadInfo.accept.split(',').map(ext => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      errors.push({
        row: 0,
        field: 'file_type',
        message: `Invalid file type. Accepted: ${uploadInfo.accept}`,
        value: fileExtension
      });
    }

    return errors;
  };

  const handleFileSelect = (file: File) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
      // Generate mock preview data
      setPreviewData([
        { id: 1, name: 'Sample Row 1', status: 'active' },
        { id: 2, name: 'Sample Row 2', status: 'pending' },
        { id: 3, name: 'Sample Row 3', status: 'active' },
      ]);
    } else {
      setSelectedFile(null);
      setPreviewData([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile);
        // Reset form on successful upload
        setSelectedFile(null);
        setValidationErrors([]);
        setPreviewData([]);
        onClose();
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setValidationErrors([]);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={`Upload ${uploadInfo.title}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive ? 'border-primary-400 bg-primary-50' : 'border-neutral-300',
            selectedFile ? 'border-success-400 bg-success-50' : ''
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-4xl mb-4">
            {selectedFile ? '📁' : '📤'}
          </div>
          
          {!selectedFile ? (
            <div>
              <p className="text-lg font-medium text-neutral-900 mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-neutral-600 mb-4">
                Accepted formats: {uploadInfo.accept} (max {uploadInfo.maxSize}MB)
              </p>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium text-success-700 mb-2">
                File Selected: {selectedFile.name}
              </p>
              <p className="text-sm text-neutral-600">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadInfo.accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
            <h4 className="font-medium text-danger-800 mb-2">Validation Errors</h4>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-danger-700">
                  {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview Data */}
        {selectedFile && previewData.length > 0 && (
          <div>
            <h4 className="font-medium text-neutral-900 mb-2">Preview (First 3 rows)</h4>
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="text-left py-2 px-3 font-medium text-neutral-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-b border-neutral-100">
                        {Object.values(row).map((value, valueIndex) => (
                          <td key={valueIndex} className="py-2 px-3 text-neutral-600">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-200">
          <Button
            variant="secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            loading={isUploading}
            disabled={!selectedFile || validationErrors.length > 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
