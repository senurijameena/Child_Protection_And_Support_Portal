import React from 'react';
import LandingHeader from '../components/LandingHeader';
import LandingHero from '../components/LandingHero';
import ServicesOverview from '../components/ServicesOverview';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustSafety from '../components/TrustSafety';
import LandingStatistics from '../components/LandingStatistics';
import LandingCTA from '../components/LandingCTA';
import LandingFooter from '../components/LandingFooter';
import { Container, Alert } from 'react-bootstrap';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-page-wrapper">
            <LandingHeader />

            <main>
                <LandingHero />

                {/* Emergency Action Section (Mini Banner) */}
                <div className="bg-red-600 py-4 overflow-hidden whitespace-nowrap">
                    <div className="flex items-center animate-scroll space-x-12">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 text-white font-black text-sm uppercase tracking-widest shrink-0">
                                <i className="bi bi-exclamation-octagon-fill"></i>
                                <span>Emergency? Call 1098 immediately</span>
                                <i className="bi bi-exclamation-octagon-fill"></i>
                                <span className="opacity-50">Local Police: 100</span>
                            </div>
                        ))}
                    </div>
                </div>

                <ServicesOverview />

                <HowItWorksSection />

                <TrustSafety />

                {/* Statistics Preview */}
                <LandingStatistics />

                <LandingCTA />
            </main>

            <LandingFooter />

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    display: flex;
                    width: max-content;
                    animation: scroll 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
