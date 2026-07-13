import { NavLink, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import { syllabus } from '../data/syllabus'

const TABS = [
  { path: 'formula-finder', label: 'Formula Finder', icon: '🔍' },
  { path: 'explorer', label: 'Explorer', icon: '⊞' },
  { path: 'saved', label: 'My Sheets', icon: '♡' },
  { path: 'history', label: 'History', icon: '🕐' },
]

export default function DashboardLayout() {
  const {
    user, handleLogout, selectedClass, sidebarOpen, setSidebarOpen,
    classPanelOpen, setClassPanelOpen, classLoaded, dark, toggleDark,
    streak, handleClassChange, bg, surface, border, border2, text, navActive, navInactive,
  } = useDashboard()

  if (!classLoaded) return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white' : 'border-black'}`} />
    </div>
  )

  return (
    <div className={`min-h-screen flex font-['Inter'] ${bg}`}>

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${surface} border-r ${border} flex flex-col h-screen sticky top-0 relative`}>
        <div className={`p-5 border-b ${border} flex items-center justify-between`}>
          {sidebarOpen && <span className={`font-black tracking-tight ${text}`}>Formula X</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-neutral-400 hover:text-black transition-colors">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(({ path, label, icon }) => (
            <NavLink key={path} to={`/dashboard/${path}`}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? navActive : navInactive}`}>
              <span>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* DARK MODE */}
        <div className={`p-3 border-t ${border}`}>
          <button onClick={toggleDark}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${navInactive}`}>
            <span>{dark ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span className="flex-1 text-left">{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>

        {/* CLASS */}
        <div className={`p-3 border-t ${border}`}>
          <button onClick={() => setClassPanelOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${navInactive}`}>
            <span>🎓</span>
            {sidebarOpen && <><span className={`flex-1 text-left font-medium ${text}`}>{selectedClass}</span><span className="text-xs text-neutral-400">edit</span></>}
          </button>
        </div>

        <div className={`p-4 border-t ${border}`}>
          <div className="flex items-center gap-3">
            <img src={user?.photoURL} className="w-8 h-8 rounded-full" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${text}`}>{user?.displayName}</p>
                <button onClick={handleLogout} className="text-xs text-neutral-400 hover:text-black transition-colors">Sign out</button>
              </div>
            )}
          </div>
        </div>

        {/* CLASS PANEL */}
        <AnimatePresence>
          {classPanelOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setClassPanelOpen(false)} className="fixed inset-0 bg-black/30 z-40" />
              <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
                transition={{ type: 'tween', duration: 0.25 }}
                className={`fixed top-0 left-0 h-screen w-72 ${surface} border-r ${border2} z-50 p-6 shadow-xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-sm font-black ${text}`}>Change Class</h3>
                  <button onClick={() => setClassPanelOpen(false)} className="text-neutral-400 hover:text-black text-sm">✕</button>
                </div>
                <div className="space-y-2">
                  {Object.keys(syllabus).map(c => (
                    <button key={c} onClick={() => handleClassChange(c)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedClass === c ? navActive : (dark ? 'border border-white/10 text-white hover:border-white/30' : 'border border-black/10 text-black hover:border-black/30')}`}>
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
        <div className={`border-b ${border} ${surface} px-8 py-4 flex items-center justify-between sticky top-0 z-10`}>
          <div>
            <p className="text-xs text-neutral-400">Good morning,</p>
            <h1 className={`text-base font-bold ${text}`}>{user?.displayName?.split(' ')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${dark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <span>🔥</span><span>{streak} day{streak > 1 ? 's' : ''}</span>
              </div>
            )}
            <span className="text-xs text-neutral-400">{selectedClass}</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  )
}
