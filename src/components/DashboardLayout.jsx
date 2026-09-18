import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, FlaskConical, BookMarked, History as HistoryIcon,
  GraduationCap, Shield, Bell, MessageCircle, Search, ChevronDown,
  Sun, Moon, Menu, X, Lock, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth } from "../../context/AuthContext";

function Monogram({ size = 28 }) {
  return (
    <motion.div
      whileHover={{ rotate: 10, scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
      className="flex items-center justify-center rounded-full border-2 shrink-0"
      style={{ width: size, height: size, borderColor: "#0A0A0A", color: "#0A0A0A" }}
    >
      <span style={{ fontFamily: "serif", fontSize: size * 0.5 }}>S</span>
    </motion.div>
  );
}

function AnimatedStreak({ value }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium"
      style={{ borderColor: "rgba(10,10,10,0.12)", color: "#0A0A0A" }}>
      <motion.span
        key={value}
        initial={{ scale: 1.4, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="w-2 h-2 rounded-full"
        style={{ background: "#FF4B3E" }}
      />
      <motion.span key={`n-${value}`} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        {value ?? 0} day streak
      </motion.span>
    </div>
  );
}

const NAV_ITEMS = [
  { key: "explorer", label: "Explorer", icon: Compass, path: "/dashboard/explorer" },
  { key: "approach", label: "Approach", icon: FlaskConical, path: "/dashboard/approach" },
  { key: "quiz", label: "Quiz", icon: GraduationCap, path: "/dashboard/quiz" },
  { key: "saved", label: "My Sheets", icon: BookMarked, path: "/dashboard/saved" },
  { key: "history", label: "History", icon: HistoryIcon, path: "/dashboard/history" },
  { key: "tutor", label: "AI Tutor", icon: Lock, path: null, locked: true },
];

const ADMIN_EMAIL = "shivenbindal@gmail.com";

export default function DashboardLayout() {
  const {
    dark, setDark,               // guessed setter name — verify against your context
    selectedClass, setSelectedClass,
    selectedSubject, streak,
  } = useDashboard();
  const { user, logout, signOut } = useAuth(); // guessed method name — verify: 'logout' or 'signOut'

  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const sidebarWidth = collapsed ? 76 : 240;

  async function handleSignOut() {
    try {
      if (typeof logout === "function") await logout();
      else if (typeof signOut === "function") await signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    }
    navigate("/");
  }

  function handleToggleTheme() {
    if (typeof setDark === "function") setDark(!dark);
  }

  const activeKey = NAV_ITEMS.find((i) => i.path && location.pathname.startsWith(i.path))?.key;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={cn("flex h-screen w-full overflow-hidden", dark ? "bg-[#0A0A0A]" : "bg-white")}
    >
      {/* ---------- Desktop sidebar ---------- */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className={cn("hidden md:flex flex-col shrink-0 border-r", dark ? "bg-[#0A0A0A]" : "bg-white")}
        style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 shrink-0">
          <Monogram size={collapsed ? 30 : 28} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className={cn("text-[15px] font-semibold tracking-tight whitespace-nowrap overflow-hidden", dark ? "text-white" : "text-black")}
              >
                FormulaLabs
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;

            if (item.locked) {
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 0.4, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-full text-[13.5px] cursor-not-allowed select-none", dark ? "text-white" : "text-black")}
                  title="Coming soon"
                >
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </motion.div>
              );
            }

            return (
              <NavLink key={item.key} to={item.path} className="block relative">
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ x: isActive ? 0 : 3 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-full text-[13.5px] z-10"
                  style={{ color: isActive ? (dark ? "#0A0A0A" : "#FFFFFF") : dark ? "#FFFFFF" : "#0A0A0A" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full -z-10"
                      style={{ background: dark ? "#FFFFFF" : "#0A0A0A" }}
                    />
                  )}
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </motion.div>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to="/dashboard/admin"
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-full text-[13.5px] hover:bg-black/[0.05] mt-2 pt-4 border-t", dark ? "text-white" : "text-black")}
              style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
            >
              <Shield size={17} strokeWidth={2} className="shrink-0" />
              {!collapsed && <span>Admin</span>}
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}>
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ backgroundColor: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0 border-2"
                style={{ borderColor: dark ? "#FFFFFF" : "#0A0A0A", color: dark ? "#FFFFFF" : "#0A0A0A" }}>
                {(user?.displayName || "U")[0].toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className={cn("text-[13px] font-medium truncate", dark ? "text-white" : "text-black")}>
                    {user?.displayName || "Student"}
                  </p>
                  <p className="text-[11px] opacity-50 truncate">Class {selectedClass || "12"}</p>
                </div>
              )}
            </motion.button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className={cn("absolute bottom-full mb-2 left-0 right-0 rounded-2xl border shadow-lg overflow-hidden", dark ? "bg-[#151515]" : "bg-white")}
                  style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
                >
                  <button
                    onClick={handleSignOut}
                    className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-black/[0.05]", dark ? "text-white" : "text-black")}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          whileHover={{ opacity: 1 }}
          onClick={() => setCollapsed((v) => !v)}
          className="h-8 border-t text-[11px] opacity-50 flex items-center justify-center gap-1 transition-opacity"
          style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)", color: dark ? "#fff" : "#0A0A0A" }}
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronLeft size={12} />
          </motion.span>
          {!collapsed && "Collapse"}
        </motion.button>
      </motion.aside>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
              onDragEnd={(_, info) => info.offset.x < -80 && setMobileOpen(false)}
              transition={{ type: "tween", duration: 0.22 }}
              className={cn("fixed top-0 left-0 bottom-0 w-[78%] max-w-[300px] z-50 flex flex-col md:hidden", dark ? "bg-[#0A0A0A]" : "bg-white")}
            >
              <div className="flex items-center justify-between px-4 h-16 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Monogram />
                  <span className={cn("text-[15px] font-semibold", dark ? "text-white" : "text-black")}>FormulaLabs</span>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} style={{ color: dark ? "#fff" : "#0A0A0A" }} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.filter((i) => !i.locked).map((item, i) => {
                  const Icon = item.icon;
                  const isActive = item.key === activeKey;
                  return (
                    <motion.div key={item.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-full text-[14px]"
                        style={{
                          background: isActive ? (dark ? "#FFFFFF" : "#0A0A0A") : "transparent",
                          color: isActive ? (dark ? "#0A0A0A" : "#FFFFFF") : dark ? "#FFFFFF" : "#0A0A0A",
                        }}
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    </motion.div>
                  );
                })}
                {isAdmin && (
                  <NavLink
                    to="/dashboard/admin"
                    onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-3 rounded-full text-[14px] mt-2 pt-4 border-t", dark ? "text-white" : "text-black")}
                    style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
                  >
                    <Shield size={18} />
                    Admin
                  </NavLink>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------- Main column ---------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={cn("flex items-center gap-3 h-16 px-4 md:px-6 border-b shrink-0", dark ? "bg-[#0A0A0A]" : "bg-white")}
          style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
        >
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={22} style={{ color: dark ? "#fff" : "#0A0A0A" }} />
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-full border"
              style={{ borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.12)" }}
            >
              <Search size={15} className="opacity-50 shrink-0" />
              <input
                placeholder="Search chapters, topics..."
                className="w-full bg-transparent outline-none text-[13.5px]"
                style={{ color: dark ? "#fff" : "#0A0A0A" }}
              />
            </motion.div>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:block">
              <AnimatedStreak value={streak} />
            </div>

            <div className="relative hidden sm:block">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setClassMenuOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px]"
                style={{ borderColor: dark ? "rgba(255,255,255,0.15)" : "rgba(10,10,10,0.12)", color: dark ? "#fff" : "#0A0A0A" }}
              >
                {selectedSubject ? `${selectedSubject} · ` : ""}Class {selectedClass || "12"}
                <motion.span animate={{ rotate: classMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={13} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {classMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={cn("absolute right-0 mt-2 w-28 rounded-2xl border shadow-lg overflow-hidden z-10", dark ? "bg-[#151515]" : "bg-white")}
                    style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
                  >
                    {["9", "10", "11", "12"].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          if (typeof setSelectedClass === "function") setSelectedClass(c);
                          setClassMenuOpen(false);
                        }}
                        className={cn("w-full text-left px-3 py-2 text-[13px] hover:bg-black/[0.05]", dark ? "text-white" : "text-black")}
                      >
                        Class {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <NavLink
                to="/dashboard/approach"
                className="px-4 py-2 rounded-full text-[13px] font-medium block"
                style={{ background: dark ? "#FFFFFF" : "#0A0A0A", color: dark ? "#0A0A0A" : "#FFFFFF" }}
              >
                Ask
              </NavLink>
            </motion.div>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => setNotifOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.05]">
              <Bell size={17} style={{ color: dark ? "#fff" : "#0A0A0A" }} />
            </motion.button>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}>
              <NavLink to="/dashboard/community?tab=chat" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.05]">
                <MessageCircle size={17} style={{ color: dark ? "#fff" : "#0A0A0A" }} />
              </NavLink>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 20 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.05]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Sun size={17} color="#fff" />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Moon size={17} color="#0A0A0A" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-24"
            onClick={() => setNotifOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className={cn("w-[92%] max-w-sm rounded-2xl border shadow-xl overflow-hidden", dark ? "bg-[#151515]" : "bg-white")}
              style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.1)" }}>
                <h3 className={cn("text-[15px] font-semibold", dark ? "text-white" : "text-black")}>Notifications</h3>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={16} style={{ color: dark ? "#fff" : "#0A0A0A" }} />
                </button>
              </div>
              <div className="p-6 text-center text-[13px] opacity-50">You're all caught up.</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
