import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { useAuth } from '../hooks/useAuth'

export function PublicUserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar expand="lg" className="bg-white shadow-sm py-2">
        <Container fluid className="px-3 px-lg-4">
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary d-flex align-items-center gap-2">
            <img src="/images/logo.jpeg" alt="Logo" className="logo-navbar" style={{ height: 28, width: 'auto' }} />
            Child Protection Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="nav" />
          <Navbar.Collapse id="nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/report-case">Report Case</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/request-help">Request Help</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/my-cases">My Cases</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/my-requests">My Requests</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/messages">Messages</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/notifications">Notifications</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/service-offers">Service Offers</Nav.Link>
              <Nav.Link as={Link} to="/dashboard/profile">Profile</Nav.Link>
            </Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" className="border-0">
                {user?.fullName || user?.email || 'User'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/dashboard/profile">Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main className="flex-grow-1 py-4">
        <Container fluid className="px-3 px-lg-4">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
