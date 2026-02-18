
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplet, Zap, Calendar } from 'lucide-react';

const Results = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state || !state.results) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <h2>No results found</h2>
                <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
            </div>
        );
    }

    const { results, imagePreview } = state;
    const { skinType, acneLevel, routine } = results;

    // Helper: Daily routine list
    const RoutineList = ({ items, title, icon }) => (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
                {icon} {title}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {items.map((rec, index) => (
                    <div key={index} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#a78bfa', minWidth: '40px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{index + 1}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                {rec.step}
                            </div>
                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{rec.product}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{rec.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Helper: Weekly routine list
    const WeeklyList = ({ items, title, icon }) => (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
                {icon} {title}
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {items.map((rec, index) => (
                    <div key={index} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'start', gap: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#34d399', minWidth: '40px', textAlign: 'center' }}>
                            <Calendar size={18} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.05em' }}>
                                    {rec.step}
                                </div>
                                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    {rec.frequency}
                                </span>
                            </div>
                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{rec.product}</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{rec.reason}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Confidence badge
    const ConfidenceBadge = ({ score }) => {
        const pct = Math.round((score || 0) * 100);
        const color = pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171';
        return (
            <span style={{ background: `${color}22`, color, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '999px', border: `1px solid ${color}44`, marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                {pct}% confidence
            </span>
        );
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
                <ArrowLeft size={20} /> Back to Upload
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem', alignItems: 'start' }}>

                {/* Left Column: Image & Skin Profile - Sticky */}
                <div style={{ position: 'sticky', top: '2rem' }}>
                    <div className="glass-card" style={{ padding: '1rem', marginBottom: '2rem' }}>
                        <img src={imagePreview} alt="Analyzed Face" style={{ width: '100%', borderRadius: '12px', display: 'block' }} />
                    </div>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Your Skin Profile</h3>

                        {/* Skin Type */}
                        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                <Droplet size={18} /> Skin Type
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                                {skinType.label || 'Unknown'}
                                <ConfidenceBadge score={skinType.score} />
                            </div>

                            {skinType.details && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Characteristics:</strong>
                                    <ul style={{ margin: '0.25rem 0 0.75rem 1.2rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {skinType.details.characteristics.map((char, i) => <li key={i}>{char}</li>)}
                                    </ul>
                                    <strong style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Goals:</strong>
                                    <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {skinType.details.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Acne Severity */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                <Zap size={18} /> Acne Severity
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                                {acneLevel.label || 'Clear'}
                                <ConfidenceBadge score={acneLevel.score} />
                            </div>

                            {acneLevel.details && (
                                <div style={{ marginTop: '1rem' }}>
                                    <strong style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Observations:</strong>
                                    <ul style={{ margin: '0.25rem 0 0.75rem 1.2rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {acneLevel.details.implications.map((imp, i) => <li key={i}>{imp}</li>)}
                                    </ul>
                                    <strong style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Expert Tips:</strong>
                                    <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                        {acneLevel.details.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Routine */}
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Your Curated Routine
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Based on your analysis, we've designed a specialized Morning and Evening routine to balance your
                        <strong style={{ color: '#fff' }}> {(skinType.label || 'unknown').toLowerCase()} skin</strong> while managing
                        <strong style={{ color: '#fff' }}> {(acneLevel.label || 'clear').toLowerCase()}</strong>.
                    </p>

                    {routine ? (
                        <>
                            <RoutineList items={routine.am} title="Morning Routine (Protect & Prevent)" icon={<span style={{ fontSize: '1.5rem' }}>☀️</span>} />
                            <RoutineList items={routine.pm} title="Evening Routine (Repair & Treat)" icon={<span style={{ fontSize: '1.5rem' }}>🌙</span>} />
                            {routine.weekly && routine.weekly.length > 0 && (
                                <WeeklyList items={routine.weekly} title="Weekly Treatments" icon={<span style={{ fontSize: '1.5rem' }}>📅</span>} />
                            )}
                        </>
                    ) : (
                        <p>No routine data available.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Results;
