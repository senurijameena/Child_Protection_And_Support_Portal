import React from 'react';
import ModernLayout from '../components/modern/ModernLayout';
import GlassCard from '../components/modern/GlassCard';
import ShinyButton from '../components/modern/ShinyButton';

const ModernTemplatePage: React.FC = () => {
    return (
        <ModernLayout logoText="Premium Portal" activePath="/modern-template">
            <div style={{ display: 'grid', gap: '2rem' }}>

                {/* Hero Section styled content */}
                <section style={{
                    textAlign: 'center',
                    padding: '4rem 0',
                    position: 'relative'
                }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(to right, #5B9BD5, #10B981)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Next Generation Interface
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2.5rem auto',
                        color: '#4B5563'
                    }}>
                        Experience the future of web design with our premium glassmorphism template.
                        Smooth animations, vibrant gradients, and intuitive interactions.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <ShinyButton onClick={() => alert('Primary Action!')}>
                            Get Started
                        </ShinyButton>
                        <ShinyButton variant="secondary" onClick={() => alert('Secondary Action!')}>
                            Learn More
                        </ShinyButton>
                    </div>
                </section>

                {/* Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    <GlassCard title="Analytics Dashboard">
                        <p>View real-time statistics and data visualization with our crystal clear interface.</p>
                        <div style={{ marginTop: '1rem', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
                    </GlassCard>

                    <GlassCard title="User Management">
                        <p>Manage permissions and roles effortlessly. The glass effect provides depth and context.</p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
                            <li>Role assignment</li>
                            <li>Activity logs</li>
                            <li>Security settings</li>
                        </ul>
                    </GlassCard>

                    <GlassCard title="Secure Messaging">
                        <p>End-to-end encrypted communication channels wrapped in a beautiful UI.</p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: '#4f46e5', borderRadius: '20px' }}>New</span>
                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>Encrypted</span>
                        </div>
                    </GlassCard>
                </div>

                {/* Feature Section */}
                <GlassCard className="full-width-feature" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Immersive Experience</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Our templates are built with performance and aesthetics in mind.
                                Utilizing the latest CSS features like backdrop-filter and complex gradients.
                            </p>
                            <ShinyButton>Explore Features</ShinyButton>
                        </div>
                        <div style={{ flex: 1, minWidth: '300px', height: '250px', background: 'linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' }}>Visual Placeholder</span>
                        </div>
                    </div>
                </GlassCard>

            </div>
        </ModernLayout>
    );
};

export default ModernTemplatePage;
