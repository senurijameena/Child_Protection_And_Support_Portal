import { useAuth } from '../../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="animate-fade-in-up">
      <h2 className="h4 fw-bold mb-4">Profile</h2>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <p><strong>Name:</strong> {user?.fullName || '-'}</p>
        <p><strong>Email:</strong> {user?.email || '-'}</p>
        <p><strong>Role:</strong> Public User</p>
      </div>
    </div>
  )
}
