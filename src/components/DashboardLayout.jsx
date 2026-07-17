import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Compass, LayoutGrid, Heart, Clock, Sun, Moon, GraduationCap,
  ChevronLeft, ChevronRight, X, Flame, Menu, Lock, School, ClipboardList, Bot,
  Search, Bell, MessageCircle, PlusCircle, Users, Sparkles, Settings, LogOut,
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import { syllabus } from '../data/syllabus'
import ComingSoon from './ComingSoon'

const TABS = [
  { path: 'explorer', label: 'Explorer', Icon: LayoutGrid, color: 'from-blue-500 to-cyan-500' },
  { path: 'approach', label: 'Approach', Icon: Compass, color: 'from-purple-500 to-pink-500' },
  { path: 'saved', label: 'My Sheets', Icon: Heart, color: 'from-red-500 to-orange-500' },
  { path: 'community', label: 'Community', Icon: Users, color: 'from-green-500 to-emerald-500' },
  { path: 'teacher', label: 'Teacher', Icon: School, color: 'from-indigo-500 to-blue-500' },
  { path: 'history', label: 'History', Icon: Clock, color: 'from-amber-500 to-orange-500' },
]

const LOCKED_TABS = [
  { label: 'Quizzes', Icon: ClipboardList },
  { label: 'AI Tutor', Icon: Bot },
]

const TITLE_MAP = {
  explorer: 'Explorer',
  approach: 'Approach',
  saved: 'My Sheets',
  community: 'Community',
  teacher: 'Teacher',
  history: 'History',
  search: 'Search',
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
  } = useDashboard()

  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bellOpen, setBellOpen] = useState(false)
  const [notificationHovered, setNotificationHovered] = useState(false)

  if (!classLoaded)
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles
            size={32}
            className={dark ? 'text-blue-400' : 'text-blue-600'}
          />
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

  const SidebarContent = ({ collapsed, onNavigate }) => (
    <>
      {/* Logo Section */}
      <motion.div
        className="h-16 px-5 flex items-center justify-between shrink-0 border-b"
        style={{
          borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className={`font-bold text-sm tracking-[-0.3px] ${text}`}>Formula</p>
              <p className={`text-[10px] ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>Labs</p>
            </div>
          </motion.div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
            <Sparkles size={14} className="text-white" strokeWidth={2.5} />
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Main Tabs */}
        {TABS.map(({ path, label, Icon, color }) => (
          <NavLink
            key={path}
            to={`/dashboard/${path}`}
            onClick={onNavigate}
            className={({ isActive }) => `
              relative group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
              text-[13px] font-medium transition-all duration-300
              ${isActive
                ? dark
                  ? 'bg-white/10 text-white'
                  : 'bg-black/5 text-black'
                : dark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-neutral-600 hover:text-black hover:bg-black/[0.03]'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="navActive"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color}`}
                    style={{ opacity: 0.1 }}
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                )}
                <div className={`relative shrink-0 ${isActive ? 'text-white' : ''}`}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                {!collapsed && <span className="relative">{label}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="navDot"
                    className="absolute right-3.5 w-2 h-2 rounded-full bg-current"
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Coming Soon Section */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3.5 pt-6 pb-2"
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-widest ${
                dark ? 'text-neutral-500' : 'text-neutral-500'
              }`}
            >
              Coming Soon
            </p>
          </motion.div>
        )}

        {LOCKED_TABS.map(({ label, Icon }) => (
          <motion.button
            key={label}
            onClick={() => setComingSoon(label)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all
              ${dark ? 'text-neutral-500 hover:bg-white/5' : 'text-neutral-500 hover:bg-black/[0.03]'} opacity-50`}
          >
            <Icon size={16} strokeWidth={2} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{label}</span>
                <Lock size={12} strokeWidth={2} />
              </>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Class Selector */}
      <motion.div
        className="px-3 py-3 border-t"
        style={{
          borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setClassPanelOpen(true)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all
            ${dark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-600 hover:bg-black/[0.03]'}`}
        >
          <div
            className={`w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0`}
          >
            <GraduationCap size={12} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <>
              <span className={`flex-1 text-left font-semibold ${text}`}>{selectedClass}</span>
              <Settings size={12} strokeWidth={2} className="text-neutral-400" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* User Profile */}
      <motion.div
        className="p-3 border-t"
        style={{
          borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <motion.img
            src={user?.photoURL}
            className="w-9 h-9 rounded-full ring-2"
            style={{
              ringColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className={`text-[12px] font-semibold truncate ${text}`}>
                {user?.displayName}
              </p>
              <motion.button
                onClick={handleLogout}
                className={`text-[11px] font-medium transition-colors flex items-center gap-1
                  ${dark ? 'text-neutral-500 hover:text-red-400' : 'text-neutral-500 hover:text-red-600'}`}
              >
                <LogOut size={10} />
                Sign out
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  )

  return (
    <div
      className={`min-h-screen flex font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Segoe_UI',Roboto,sans-serif] ${bg}`}
    >
      {/* DESKTOP SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`hidden md:flex ${surface} flex-col h-screen sticky top-0 border-r relative overflow-hidden`}
        style={{
          borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        }}
      >
        <SidebarContent collapsed={!sidebarOpen} />

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center transition-all z-10
            ${dark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white text-black hover:bg-neutral-100'} shadow-lg`}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={12} strokeWidth={2.5} />
          </motion.div>
        </motion.button>

        {/* Theme Toggle */}
        <motion.div
          className="absolute bottom-24 -right-3 flex flex-col rounded-full shadow-lg overflow-hidden z-10"
          style={{
            background: dark ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDark}
            className={`w-6 h-6 flex items-center justify-center transition-all ${
              !dark ? 'bg-black text-yellow-400' : 'text-neutral-500'
            }`}
          >
            <Sun size={12} strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDark}
            className={`w-6 h-6 flex items-center justify-center transition-all ${
              dark ? 'bg-black text-blue-400' : 'text-neutral-500'
            }`}
          >
            <Moon size={12} strokeWidth={2} />
          </motion.button>
        </motion.div>
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
              className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col ${surface} shadow-2xl md:hidden`}
            >
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <motion.div
          className={`h-16 px-5 md:px-8 flex items-center justify-between gap-4 border-b ${surface} sticky top-0 z-10`}
          style={{
            borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(true)}
              className={`md:hidden ${dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
            >
              <Menu size={20} strokeWidth={2} />
            </motion.button>
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`hidden sm:block text-lg font-bold tracking-[-0.3px] ${text}`}
            >
              {pageTitle}
            </motion.h1>
          </div>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md hidden sm:block"
            whileFocus={{ scale: 1.02 }}
          >
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all
                ${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/[0.03] hover:bg-black/5'}`}
            >
              <Search size={14} strokeWidth={2} className="text-neutral-400 shrink-0" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search chapters, people..."
                className={`bg-transparent border-0 outline-none text-[13px] w-full placeholder-neutral-400 ${text}`}
              />
            </div>
          </motion.form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak */}
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold
                  ${dark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-600'}`}
              >
                <motion.div animate={{ rotate: [0, -20, 20, 0] }} transition={{ duration: 0.6 }}>
                  <Flame size={12} strokeWidth={2.5} />
                </motion.div>
                <span>{streak} day{streak > 1 ? 's' : ''}</span>
              </motion.div>
            )}

            {/* Ask Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/community?compose=true')}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all
                ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-900'}`}
            >
              <PlusCircle size={14} strokeWidth={2.5} />
              <span>Ask</span>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setBellOpen(!bellOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                  ${dark ? 'text-neutral-400 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.05]'}`}
              >
                <Bell size={16} strokeWidth={2} />
              </motion.button>
              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute right-0 mt-3 w-72 rounded-2xl shadow-xl border p-5 z-20
                      ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-sm font-bold ${text}`}>Notifications</p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => setBellOpen(false)}
                        className={`text-neutral-400 hover:text-current`}
                      >
                        <X size={14} strokeWidth={2} />
                      </motion.button>
                    </div>
                    <p className={`text-[12px] ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Nothing new yet — replies and follows will show up here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard/community?tab=chat')}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                ${dark ? 'text-neutral-400 hover:bg-white/10' : 'text-neutral-600 hover:bg-black/[0.05]'}`}
            >
              <MessageCircle size={16} strokeWidth={2} />
            </motion.button>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/dashboard/community?tab=profile')}
              className="shrink-0 ring-2 ring-transparent hover:ring-blue-500/30 rounded-full transition-all"
            >
              <img src={user?.photoURL} className="w-8 h-8 rounded-full" alt="Profile" />
            </motion.button>
          </div>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* CLASS PANEL */}
      <AnimatePresence>
        {classPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClassPanelOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 left-0 h-screen w-80 ${surface} z-50 p-6 md:p-8 shadow-2xl border-r`}
              style={{
                borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold tracking-[-0.3px] ${text}`}>
                  Change Class
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setClassPanelOpen(false)}
                  className={`${dark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
                >
                  <X size={18} strokeWidth={2} />
                </motion.button>
              </div>
              <div className="space-y-2">
                {Object.keys(syllabus).map((c, index) => (
                  <motion.button
                    key={c}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClassChange(c)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
                      selectedClass === c
                        ? dark
                          ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-blue-500/50'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 text-black border border-blue-400'
                        : dark
                          ? 'border border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white'
                          : 'border border-black/10 text-neutral-600 hover:bg-black/[0.03]'
                    }`}
                  >
                    {c}
                  </motion.button>
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
