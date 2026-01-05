import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import LandingStatistics from '../components/LandingStatistics';
import HowItWorks from '../components/HowItWorks';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import FeaturesShowcase from '../components/FeaturesShowcase';

const LandingPage: React.FC = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <LandingStatistics />
      <HowItWorks />
      <FeaturesShowcase />
      <TestimonialsSection />
      <Footer />
    </>
  );
};

export default LandingPage;

