import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, LayoutGrid, Heart, Clock, Sun, Moon, GraduationCap,
  ChevronLeft, ChevronRight, X, Flame, Menu, Lock, School, ClipboardList, Bot,
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { syllabus } from '../data/syllabus'
import ComingSoon from './ComingSoon'

const TABS = [
  { path: 'formula-finder', label: 'Formula Finder', Icon: Search },
  { path: 'explorer', label: 'Explorer', Icon: LayoutGrid },
  { path: 'saved', label: 'My Sheets', Icon: Heart },
  { path: 'history', label: 'History', Icon: Clock },
]

const LOCKED_TABS = [
  { label: 'Teacher Portal', Icon: School },
  { label: 'Quizzes', Icon: ClipboardList },
  { label: 'AI Tutor', Icon: Bot },
]

export default function DashboardLayout() {
  const {
    user, handleLogout, selectedClass, sidebarOpen, setSidebarOpen,
    classPanelOpen, setClassPanelOpen, classLoaded, dark, toggleDark,
    streak, handleClassChange, bg, surface, text,
  } = useDashboard()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState(null)

  if (!classLoaded) return (
    <div className={`min-h-screen flex items-center justify-center ${bg}`}>
      <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${dark ? 'border-white/40' : 'border-black/20'}`} />
    </div>
  )

  const activeRow = dark ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-black shadow-sm'
  const inactiveRow = dark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-500 hover:bg-black/[0.03]'

  const SidebarContent = ({ collapsed, onNavigate }) => (
    <>
      <div className="h-16 px-5 flex items-center justify-between shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-[15px] tracking-[-0.3px] ${text}`}>Formula Labs</span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#D4FF00]" />
          </div>
        ) : (
          <span className="w-[3px] h-[3px] rounded-full bg-[#D4FF00] mx-auto" />
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {TABS.map(({ path, label, Icon }) => (
          <NavLink key={path} to={`/dashboard/${path}`} onClick={onNavigate}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${isActive ? activeRow : inactiveRow}`
            }>
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="px-3.5 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Coming soon</p>
        )}
        {LOCKED_TABS.map(({ label, Icon }) => (
          <button key={label} onClick={() => setComingSoon(label)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${inactiveRow} opacity-60`}>
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left">{label}</span>}
            {!collapsed && <Lock size={12} strokeWidth={2} />}
          </button>
        ))}
      </nav>

      <div className="px-3 py-3">
        <button onClick={() => setClassPanelOpen(true)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all ${inactiveRow}`}>
          <GraduationCap size={16} strokeWidth={2} />
          {!collapsed && (
            <>
              <span className={`flex-1 text-left font-medium ${text}`}>{selectedClass}</span>
              <span className="text-[11px] text-neutral-400">edit</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 border-t border-black/[0.04]">
        <div className="flex items-center gap-3">
          <img src={user?.photoURL} className="w-8 h-8 rounded-full" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-medium truncate ${text}`}>{user?.displayName}</p>
              <button onClick={handleLogout} className="text-[11px] text-neutral-400 hover:text-black transition-colors">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className={`min-h-screen flex font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Segoe_UI',Roboto,sans-serif] ${bg}`}>

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex ${sidebarOpen ? 'w-64' : 'w-[72px]'} transition-all duration-300 ${surface} flex-col h-screen sticky top-0 border-r border-black/[0.04]`}>
        <SidebarContent collapsed={!sidebarOpen} />
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-neutral-400 hover:text-black transition-colors">
          {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* FLOATING DARK MODE TOGGLE */}
        <div className="absolute bottom-24 -right-3 flex flex-col rounded-full shadow-md border border-black/5 overflow-hidden bg-white">
          <button onClick={toggleDark} className={`w-6 h-6 flex items-center justify-center ${!dark ? 'bg-black text-white' : 'text-neutral-400'}`}>
            <Sun size={11} strokeWidth={2} />
          </button>
          <button onClick={toggleDark} className={`w-6 h-6 flex items-center justify-center ${dark ? 'bg-black text-white' : 'text-neutral-400'}`}>
            <Moon size={11} strokeWidth={2} />
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 md:hidden" />
            <motion.div
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              drag="x"
              dragConstraints={{ left: -288, right: 0 }}
              dragElastic={0.05}
              onDragEnd={(e, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) setMobileOpen(false)
              }}
              className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col ${surface} shadow-2xl md:hidden`}>
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">
        <div className={`h-16 px-5 md:px-8 flex items-center justify-between border-b border-black/[0.04] ${surface} sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-neutral-500">
              <Menu size={20} strokeWidth={2} />
            </button>
            <div>
              <p className="text-[11px] text-neutral-400 leading-none mb-0.5">Good morning</p>
              <h1 className={`text-[14px] font-semibold tracking-[-0.2px] leading-none ${text}`}>{user?.displayName?.split(' ')[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium ${dark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <Flame size={12} strokeWidth={2.5} />
                <span className="hidden sm:inline">{streak} day{streak > 1 ? 's' : ''}</span>
              </div>
            )}
            <span className="hidden sm:inline text-[12px] text-neutral-400">{selectedClass}</span>
          </div>
        </div>

        <Outlet />
      </main>

      {/* CLASS PANEL (shared) */}
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
                <button onClick={() => setClassPanelOpen(false)} className="text-neutral-400 hover:text-black transition-colors">
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
              <div className="space-y-2">
                {Object.keys(syllabus).map(c => (
                  <button key={c} onClick={() => handleClassChange(c)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-[13px] font-medium transition-all ${
                      selectedClass === c ? activeRow : dark ? 'border border-white/8 text-white' : 'border border-black/6 text-black'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ComingSoon open={!!comingSoon} onClose={() => setComingSoon(null)} label={comingSoon} />
    </div>
  )
}
