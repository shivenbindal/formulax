import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Compass, LayoutGrid, Heart, Clock, Sun, Moon, GraduationCap,
  ChevronLeft, X, Flame, Menu, Lock, School, ClipboardList, Bot,
  Search, Bell, MessageCircle, PlusCircle, Users, Sparkles, Settings, LogOut, Shield,
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { syllabus } from '../data/syllabus'
import ComingSoon from './ComingSoon'

const ADMIN_EMAIL = 'shivenbindal@gmail.com'
const LIME = '#D4FF00'
const SIDEBAR_OPEN_W = 240
const SIDEBAR_CLOSED_W = 76

const ALL_TABS = [
  { path: 'explorer', label: 'Explorer', Icon: LayoutGrid },
  { path: 'approach', label: 'Approach', Icon: Compass },
  { path: 'quiz', label: 'Quizzes', Icon: ClipboardList },
  { path: 'saved', label: 'My Sheets', Icon: Heart },
  { path: 'community', label: 'Community', Icon: Users },
  { path: 'teacher', label: 'Teacher', Icon: School },
  { path: 'history', label: 'History', Icon: Clock },
  { path: 'admin', label: 'Admin', Icon: Shield },
]

const LOCKED_TABS = [{ label: 'AI Tutor', Icon: Bot }]

const TITLE_MAP = {
  explorer: 'Explorer',
  approach: 'Approach',
  quiz: 'Quizzes',
  saved: 'My Sheets',
  community: 'Community',
  teacher: 'Teacher',
  history: 'History',
  search: 'Search',
  admin: 'Admin',
}

export default function DashboardLayout() {
  const {
    user,
    handleLogout,
    selectedClass,
    sidebarOpen,
    setSidebarOpen,
    classPanelOpen,
    setClassPanelOpen,
    classLoaded,
    dark,
    toggleDark,
    streak,
    handleClassChange,
    bg,
    surface,
    text,
    role,
  } = useDashboard()

  const TABS = ALL_TABS.filter((t) =>
    (t.path !== 'teacher' || role === 'teacher') &&
    (t.path !== 'admin' || user?.email === ADMIN_EMAIL)
  )
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bellOpen, setBellOpen] = useState(false)

  const hairline = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const hairlineSoft = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const mutedText = dark ? 'text-neutral-400' : 'text-neutral-500'

  if (!classLoaded)
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={26} style={{ color: LIME }} strokeWidth={2} />
        </motion.div>
      </div>
    )

  const currentSegment = location.pathname.split('/')[2] || 'explorer'
  const pageTitle = TITLE_MAP[currentSegment] || 'Dashboard'

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    navigate(`/dashboard/search?q=${encodeURIComponent(searchTerm.trim())}`)
    setMobileOpen(false)
  }

  const NavItem = ({ path, label, Icon, collapsed, onNavigate }) => (
    <NavLink
      to={`/dashboard/${path}`}
      onClick={onNavigate}
      className={({ isActive }) => `
        flex items-center gap-3 pl-3 pr-3.5 py-2.5 rounded-lg border-l-2
        text-[13px] font-medium transition-colors duration-150
        ${isActive
          ? dark
            ? 'bg-white/[0.06] text-white'
            : 'bg-black/[0.04] text-black'
          : dark
            ? 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            : 'border-transparent text-neutral-500 hover:text-black hover:bg-black/[0.03]'
        }
      `}
      style={({ isActive }) => ({ borderLeftColor: isActive ? LIME : 'transparent' })}
    >
      <Icon size={16} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )

  const SidebarContent = ({ collapsed, onNavigate }) => (
    <>
      {/* Logo */}
      <div className="h-16 px-5 flex items-center shrink-0 border-b" style={{ borderColor: hairlineSoft }}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-white' : 'bg-black'}`}>
            <Sparkles size={15} style={{ color: LIME }} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              <p className={`font-bold text-sm tracking-[-0.3px] leading-none ${text}`}>Formula</p>
              <p className={`text-[10px] leading-none mt-0.5 ${mutedText}`}>Labs</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {TABS.map((t) => (
          <NavItem key={t.path} {...t} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {!collapsed && (
          <p className={`px-3.5 pt-6 pb-2 text-[10px] font-semibold uppercase tracking-widest ${mutedText}`}>
            Coming soon
          </p>
        )}

        {LOCKED_TABS.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => setComingSoon(label)}
            className={`w-full flex items-center gap-3 pl-3 pr-3.5 py-2.5 rounded-lg border-l-2 border-transparent
              text-[13px] font-medium transition-colors opacity-50
              ${dark ? 'text-neutral-500 hover:bg-white/[0.04]' : 'text-neutral-500 hover:bg-black/[0.03]'}`}
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{label}</span>
                <Lock size={12} strokeWidth={2} />
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Footer: class selector + profile */}
      <div className="border-t" style={{ borderColor: hairlineSoft }}>
        <button
          onClick={() => setClassPanelOpen(true)}
          className={`w-full flex items-center gap-3 px-3 pt-3 pb-2.5 text-[13px] font-medium transition-colors
            ${dark ? 'text-neutral-300 hover:bg-white/[0.04]' : 'text-neutral-700 hover:bg-black/[0.03]'}`}
        >
          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${dark ? 'border-white/15' : 'border-black/15'}`}>
            <GraduationCap size={12} strokeWidth={2} />
          </div>
          {!collapsed && (
            <>
              <span className={`flex-1 text-left font-semibold ${text}`}>{selectedClass}</span>
              <Settings size={12} strokeWidth={2} className={mutedText} />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 px-3 pb-3 pt-1">
          <img src={user?.photoURL} className={`w-8 h-8 rounded-full shrink-0 border ${dark ? 'border-white/15' : 'border-black/10'}`} alt="" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-semibold truncate ${text}`}>{user?.displayName}</p>
              <button
                onClick={handleLogout}
                className={`text-[11px] font-medium flex items-center gap-1 transition-colors
                  ${dark ? 'text-neutral-500 hover:text-red-400' : 'text-neutral-500 hover:text-red-600'}`}
              >
                <LogOut size={10} />
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
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSED_W }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`hidden md:flex ${surface} flex-col h-screen sticky top-0 border-r relative`}
        style={{ borderColor: hairlineSoft }}
      >
        <SidebarContent collapsed={!sidebarOpen} />

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center border transition-colors z-10
            ${dark ? 'bg-black border-white/15 text-white hover:bg-neutral-900' : 'bg-white border-black/10 text-black hover:bg-neutral-50'}`}
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={12} strokeWidth={2.5} />
          </motion.div>
        </button>

        <button
          onClick={toggleDark}
          className={`absolute bottom-24 -right-3 w-6 h-6 rounded-full flex items-center justify-center border transition-colors z-10
            ${dark ? 'bg-black border-white/15 text-neutral-300 hover:text-white' : 'bg-white border-black/10 text-neutral-500 hover:text-black'}`}
        >
          {dark ? <Moon size={12} strokeWidth={2} /> : <Sun size={12} strokeWidth={2} />}
        </button>
      </motion.aside>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="x"
              dragConstraints={{ left: -288, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.x < -80 || info.velocity.x < -400) setMobileOpen(false)
              }}
              className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col ${surface} border-r md:hidden`}
              style={{ borderColor: hairlineSoft }}
            >
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        <div
          className={`h-16 px-5 md:px-8 flex items-center justify-between gap-4 border-b ${surface} sticky top-0 z-10`}
          style={{ borderColor: hairlineSoft }}
        >
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden ${dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              <Menu size={20} strokeWidth={2} />
            </button>
            <h1 className={`hidden sm:block text-lg font-bold tracking-[-0.3px] ${text}`}>{pageTitle}</h1>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden sm:block">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors
              ${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/[0.03] hover:bg-black/[0.05]'}`}>
              <Search size={14} strokeWidth={2} className={`shrink-0 ${mutedText}`} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters, people..."
                className={`bg-transparent border-0 outline-none text-[13px] w-full placeholder-neutral-400 ${text}`}
              />
            </div>
          </form>

          <div className="flex items-center gap-2 shrink-0">
            {streak > 0 && (
              <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border
                ${dark ? 'border-white/10 text-neutral-300' : 'border-black/10 text-neutral-700'}`}>
                <Flame size={12} strokeWidth={2.5} style={{ color: LIME }} />
                <span>{streak} day{streak > 1 ? 's' : ''}</span>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/community?compose=true')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-black transition-transform hover:scale-[1.03]"
              style={{ backgroundColor: LIME }}
            >
              <PlusCircle size={14} strokeWidth={2.5} />
              <span>Ask</span>
            </button>

            <button
              onClick={() => setBellOpen(true)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${dark ? 'text-neutral-400 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.05]'}`}
            >
              <Bell size={16} strokeWidth={2} />
            </button>

            <button
              onClick={() => navigate('/dashboard/community?tab=chat')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${dark ? 'text-neutral-400 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.05]'}`}
            >
              <MessageCircle size={16} strokeWidth={2} />
            </button>

            <button
              onClick={() => navigate('/dashboard/community?tab=profile')}
              className={`shrink-0 rounded-full border ${dark ? 'border-white/15' : 'border-black/10'}`}
            >
              <img src={user?.photoURL} className="w-8 h-8 rounded-full" alt="Profile" />
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.div>
      </main>

      {/* CLASS SWITCHER — modal */}
      <AnimatePresence>
        {classPanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setClassPanelOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl border p-6 ${surface}`}
              style={{ borderColor: hairline }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-base font-bold tracking-[-0.3px] ${text}`}>Change class</h3>
                <button
                  onClick={() => setClassPanelOpen(false)}
                  className={dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <div className="space-y-1.5">
                {Object.keys(syllabus).map((c) => {
                  const active = selectedClass === c
                  return (
                    <button
                      key={c}
                      onClick={() => { handleClassChange(c); setClassPanelOpen(false) }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold border-l-2 transition-colors
                        ${active
                          ? dark ? 'bg-white/[0.06] text-white' : 'bg-black/[0.04] text-black'
                          : dark ? 'border-transparent text-neutral-400 hover:bg-white/[0.04]' : 'border-transparent text-neutral-600 hover:bg-black/[0.03]'
                        }`}
                      style={{ borderLeftColor: active ? LIME : 'transparent' }}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS — modal */}
      <AnimatePresence>
        {bellOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBellOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl border p-6 ${surface}`}
              style={{ borderColor: hairline }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-base font-bold tracking-[-0.3px] ${text}`}>Notifications</h3>
                <button
                  onClick={() => setBellOpen(false)}
                  className={dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'}
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>
              <p className={`text-[12px] ${mutedText}`}>Nothing new yet — replies and follows will show up here.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ComingSoon open={!!comingSoon} onClose={() => setComingSoon(null)} label={comingSoon} />
    </div>
  )
}
