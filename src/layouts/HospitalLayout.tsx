import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function HospitalLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
