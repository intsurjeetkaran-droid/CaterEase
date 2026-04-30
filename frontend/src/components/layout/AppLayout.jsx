import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

/**
 * Authenticated app shell — sidebar + main content area
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Content shifts right on desktop to clear sidebar, adds top padding on mobile for top bar */}
      <main className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppLayout
