import { NavLink, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, LayoutGrid, Heart, Clock, Sun, Moon, GraduationCap, ChevronLeft, ChevronRight, X, Flame } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { syllabus } from '../data/syllabus'

const TABS = [
  { path: 'formula-finder', label: 'Formula Finder', Icon: Search },
  { path: 'explorer', label: 'Explorer', Icon: LayoutGrid },
  { path: 'saved', label: 'My Sheets', Icon: Heart },
  { path: 'history', label: 'History', Icon: Clock },
]

export default function DashboardLayout() {
  const {
    user, handleLogout, selectedClass, sidebarOpen, setSidebarOpen,
    classPanelOpen, setClassPanelOpen, classLoaded, dark, toggleDark,
    streak, handleClassChange, bg, surface, border, border2, text, navActive, navInactive,
  } = useDashboard()

  if (!classLoaded) return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white/40' : 'border-black/20'}`} />
    </div>
  )

  return (
    <div className={`min-h-screen flex font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Segoe_UI',Roboto,sans-serif] ${bg}`}>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-[72px]'} transition-all duration-300 ${surface} border-r ${dark ? 'border-white/8' : 'border-black/5'} flex flex-col h-screen sticky top-0`}>

        {/* LOGO */}
        <div className={`h-16 px-5 flex items-center justify-between border-b ${dark ? 'border-white/8' : 'border-black/5'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-[15px] tracking-[-0.3px] ${text}`}>Formula Labs</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#D4FF00]" />
            </div>
          ) : (
            <span className="w-[3px] h-[3px] rounded-full bg-[#D4FF00] mx-auto" />
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${sidebarOpen ? '' : 'hidden'} text-[#86868B] hover:text-black transition-colors`}>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(({ path, label, Icon }) => (
            <NavLink key={path} to={`/dashboard/${path}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all ${isActive ? navActive : navInactive}`
              }>
              <Icon size={16} strokeWidth={2} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)}
            className="mx-auto mb-2 text-[#86868B] hover:text-black transition-colors">
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        )}

        {/* DARK MODE */}
        <div className={`px-3 py-3 border-t ${dark ? 'border-white/8' : 'border-black/5'}`}>
          <button onClick={toggleDark}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all ${navInactive}`}>
            {dark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
            {sidebarOpen && <span className="flex-1 text-left">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* CLASS */}
        <div className={`px-3 py-3 border-t ${dark ? 'border-white/8' : 'border-black/5'}`}>
          <button onClick={() => setClassPanelOpen(true)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all ${navInactive}`}>
            <GraduationCap size={16} strokeWidth={2} />
            {sidebarOpen && (
              <>
                <span className={`flex-1 text-left font-medium ${text}`}>{selectedClass}</span>
                <span className="text-[11px] text-[#86868B]">edit</span>
              </>
            )}
          </button>
        </div>

        {/* USER */}
        <div className={`p-4 border-t ${dark ? 'border-white/8' : 'border-black/5'}`}>
          <div className="flex items-center gap-3">
            <img src={user?.photoURL} className="w-8 h-8 rounded-full" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] font-medium truncate ${text}`}>{user?.displayName}</p>
                <button onClick={handleLogout} className="text-[11px] text-[#86868B] hover:text-black transition-colors">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CLASS PANEL */}
        <AnimatePresence>
          {classPanelOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setClassPanelOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" />
              <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
                transition={{ type: 'tween', duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className={`fixed top-0 left-0 h-screen w-80 ${surface} z-50 p-8 shadow-2xl`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`text-[15px] font-semibold tracking-[-0.2px] ${text}`}>Change class</h3>
                  <button onClick={() => setClassPanelOpen(false)}
                    className="text-[#86868B] hover:text-black transition-colors">
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.keys(syllabus).map(c => (
                    <button key={c} onClick={() => handleClassChange(c)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                        selectedClass === c
                          ? navActive
                          : dark ? 'border border-white/8 text-white hover:border-white/16' : 'border border-black/6 text-black hover:border-black/12'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">

        {/* HEADER */}
        <div className={`h-16 px-8 flex items-center justify-between border-b ${dark ? 'border-white/8' : 'border-black/5'} ${surface} sticky top-0 z-10`}>
          <div>
            <p className="text-[11px] text-[#86868B] leading-none mb-0.5">Good morning</p>
            <h1 className={`text-[14px] font-semibold tracking-[-0.2px] leading-none ${text}`}>{user?.displayName?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${dark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <Flame size={12} strokeWidth={2.5} />
                <span>{streak} day{streak > 1 ? 's' : ''}</span>
              </div>
            )}
            <span className="text-[12px] text-[#86868B]">{selectedClass}</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
