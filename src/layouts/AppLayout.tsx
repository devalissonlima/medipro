import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { X } from "lucide-react"

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-slate-900 transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={closeMobileMenu}
          className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        <Sidebar onNavigate={closeMobileMenu} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleMobileMenu={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div key={location.pathname} className="animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
