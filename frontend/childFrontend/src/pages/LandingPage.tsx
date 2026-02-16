import { PublicNavbar } from '../components/PublicNavbar'
import { HeroSection } from '../components/HeroSection'
import { AboutSection } from '../components/AboutSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { TestimonialsSection } from '../components/TestimonialsSection'
import { LandingFooter } from '../components/LandingFooter'

export function LandingPage() {
  return (
    <div className="d-flex flex-column min-vh-100 landing-page-root">
      <PublicNavbar />
      <main className="flex-grow-1 landing-page-main">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  )
}
