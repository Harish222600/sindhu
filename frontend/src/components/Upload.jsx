
import React, { useRef, useState } from 'react';
import { Camera, Upload as UploadIcon, X } from 'lucide-react';

const Upload = ({ onFileSelect }) => {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={`glass-card section-upload ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
                padding: '3rem',
                textAlign: 'center',
                borderStyle: 'dashed',
                borderWidth: dragActive ? '2px' : '1px',
                borderColor: dragActive ? 'var(--accent-color)' : 'var(--glass-border)',
                transition: 'all 0.3s ease'
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                <UploadIcon size={48} style={{ margin: '0 auto', display: 'block', color: 'var(--accent-color)' }} />
            </div>

            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Upload your photo</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Drag and drop or click to browse</p>

            <button
                className="btn-primary"
                onClick={() => inputRef.current.click()}
            >
                Select Photo
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Supports: JPG, PNG, JPEG
            </p>
        </div>
    );
};

export default Upload;
