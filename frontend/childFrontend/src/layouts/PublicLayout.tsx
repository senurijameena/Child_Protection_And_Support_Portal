import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '../components/PublicNavbar'
import { LandingFooter } from '../components/LandingFooter'

export function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <main className="pt-5">
        <Outlet />
      </main>
      <LandingFooter />
    </>
  )
}
