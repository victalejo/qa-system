import React, { useState, useRef } from 'react';
import './ImageUploader.css';

interface ImageUploaderProps {
  images: File[];
  uploadedImages?: string[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  uploadedImages = [],
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido: ${file.name}. Solo se aceptan: JPG, PNG, GIF, WEBP`);
      return false;
    }

    if (file.size > maxSizeBytes) {
      setError(`El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setError('');
    const newFiles = Array.from(files);
    const totalImages = images.length + uploadedImages.length + newFiles.length;

    if (totalImages > maxImages) {
      setError(`No puedes subir más de ${maxImages} imágenes en total`);
      return;
    }

    const validFiles = newFiles.filter(validateFile);

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getImagePreviewURL = (file: File): string => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="image-uploader">
      {error && (
        <div className="image-uploader-error">
          {error}
        </div>
      )}

      <div
        className={`image-uploader-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <div className="image-uploader-dropzone-content">
          <svg className="image-uploader-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p className="image-uploader-text">
            Arrastra y suelta imágenes aquí, o
          </p>
          <button
            type="button"
            onClick={handleButtonClick}
            className="image-uploader-button"
          >
            Seleccionar archivos
          </button>
          <p className="image-uploader-hint">
            PNG, JPG, GIF, WEBP (máx. {maxSizeMB}MB por archivo)
          </p>
          <p className="image-uploader-hint">
            Máximo {maxImages} imágenes
          </p>
        </div>
      </div>

      {(images.length > 0 || uploadedImages.length > 0) && (
        <div className="image-uploader-preview">
          <h4>Imágenes ({images.length + uploadedImages.length}/{maxImages})</h4>
          <div className="image-uploader-grid">
            {/* Mostrar imágenes ya subidas */}
            {uploadedImages.map((url, index) => (
              <div key={`uploaded-${index}`} className="image-preview-item uploaded">
                <img src={url} alt={`Screenshot ${index + 1}`} />
                <div className="image-preview-overlay">
                  <span className="image-preview-label">Subida</span>
                </div>
              </div>
            ))}

            {/* Mostrar imágenes nuevas */}
            {images.map((file, index) => (
              <div key={`new-${index}`} className="image-preview-item">
                <img src={getImagePreviewURL(file)} alt={file.name} />
                <div className="image-preview-overlay">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="image-preview-remove"
                    title="Eliminar imagen"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="image-preview-info">
                  <span className="image-preview-name">{file.name}</span>
                  <span className="image-preview-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
