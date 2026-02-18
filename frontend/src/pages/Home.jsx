
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Upload from '../components/Upload';
import { analyzeImage } from '../api';
import { Loader2 } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = async (file) => {
        setLoading(true);
        setError(null);
        try {
            const data = await analyzeImage(file);
            navigate('/results', { state: { results: data, imagePreview: URL.createObjectURL(file) } });
        } catch (err) {
            console.error(err);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Discover Your Skin's<br />Unique Needs
                </h2>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    AI-powered analysis to detect your skin type and recommend the perfect routine.
                </p>
            </div>

            <div style={{ width: '100%', maxWidth: '500px' }}>
                {loading ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <Loader2 className="spin" size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
                        <h3>Analyzing your skin...</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Please wait a moment</p>
                        <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
                    </div>
                ) : (
                    <Upload onFileSelect={handleFileSelect} />
                )}

                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
