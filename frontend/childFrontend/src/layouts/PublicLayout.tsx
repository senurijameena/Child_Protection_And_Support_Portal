import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '../components/PublicNavbar'
import { LandingFooter } from '../components/LandingFooter'

export function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  )
}
