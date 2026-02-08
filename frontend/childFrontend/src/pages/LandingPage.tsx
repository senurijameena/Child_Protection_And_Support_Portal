import { LandingNavbar } from '../components/LandingNavbar'
import { HeroSection } from '../components/HeroSection'
import { AboutSection } from '../components/AboutSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { LandingFooter } from '../components/LandingFooter'

export function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <TestimonialsSection />
        <LandingFooter />
      </main>
    </>
  )
}
