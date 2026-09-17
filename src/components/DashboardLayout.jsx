// src/pages/dashboard/DashboardLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, FlaskConical, BookMarked, History as HistoryIcon,
  GraduationCap, Shield, Bell, MessageCircle, Search, ChevronDown,
  Sun, Moon, Menu, X, Lock, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext"; // assumed existing — adjust path if different
import { auth } from "@/lib/firebase"; // assumed existing firebase init
import { signOut } from "firebase/auth";

// ---- S monogram mark ----
function Monogram({ size = 28 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: "#D4FF00",
        color: "#0A0A0A",
        fontFamily: "'Fraunces', serif",
        fontSize: size * 0.55,
      }}
    >
      S
    </div>
  );
}

const NAV_ITEMS = [
  { key: "explorer", label: "Explorer", icon: Compass, path: "/dashboard/explorer" },
  { key: "approach", label: "Approach", icon: FlaskConical, path: "/dashboard/approach" },
  { key: "quiz", label: "Quiz", icon: GraduationCap, path: "/dashboard/quiz" },
  { key: "sheets", label: "My Sheets", icon: BookMarked, path: "/dashboard/sheets" },
  { key: "history", label: "History", icon: HistoryIcon, path: "/dashboard/history" },
  { key: "tutor", label: "AI Tutor", icon: Lock, path: null, locked: true },
];

const ADMIN_EMAIL = "shivenbindal@gmail.com";

export default function DashboardLayout() {
  const { user, classLevel, setClassLevel, theme, toggleTheme } = useDashboard();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const sidebarWidth = collapsed ? 76 : 240;

  async function handleSignOut() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "#F5F5F3" }}
    >
      {/* ---------- Desktop sidebar ---------- */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r transition-[width] duration-200 ease-out"
        style={{
          width: sidebarWidth,
          background: "#FAFAF8",
          borderColor: "rgba(10,10,10,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 shrink-0">
          <Monogram />
          {!collapsed && (
            <span
              className="text-[15px] font-medium tracking-tight"
              style={{ color: "#0A0A0A" }}
            >
              FormulaLabs
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.locked) {
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] opacity-40 cursor-not-allowed select-none"
                  style={{ color: "#0A0A0A" }}
                  title="Coming soon"
                >
                  <Icon size={17} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            }
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors",
                    isActive ? "font-medium" : "hover:bg-black/[0.04]"
                  )
                }
                style={({ isActive }) => ({
                  background: isActive ? "#0A0A0A" : "transparent",
                  color: isActive ? "#FAFAF8" : "#0A0A0A",
                })}
              >
                <Icon size={17} strokeWidth={2} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to="/dashboard/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] hover:bg-black/[0.04] mt-2 pt-3 border-t"
              style={{ color: "#0A0A0A", borderColor: "rgba(10,10,10,0.08)" }}
            >
              <Shield size={17} strokeWidth={2} className="shrink-0" />
              {!collapsed && <span>Admin</span>}
            </NavLink>
          )}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "rgba(10,10,10,0.08)" }}>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-black/[0.04] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
                style={{ background: "#0A0A0A", color: "#FAFAF8" }}
              >
                {(user?.displayName || "U")[0].toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "#0A0A0A" }}>
                    {user?.displayName || "Student"}
                  </p>
                  <p className="text-[11px] opacity-50 truncate">Class {classLevel || "12"}</p>
                </div>
              )}
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border shadow-lg overflow-hidden"
                  style={{ background: "#FAFAF8", borderColor: "rgba(10,10,10,0.08)" }}
                >
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] hover:bg-black/[0.04]"
                    style={{ color: "#0A0A0A" }}
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="h-8 border-t text-[11px] opacity-50 hover:opacity-100 transition-opacity"
          style={{ borderColor: "rgba(10,10,10,0.08)" }}
        >
          {collapsed ? "→" : "← Collapse"}
        </button>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) setMobileOpen(false);
              }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed top-0 left-0 bottom-0 w-[78%] max-w-[300px] z-50 flex flex-col md:hidden"
              style={{ background: "#FAFAF8" }}
            >
              <div className="flex items-center justify-between px-4 h-16 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Monogram />
                  <span className="text-[15px] font-medium" style={{ color: "#0A0A0A" }}>
                    FormulaLabs
                  </span>
                </div>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} style={{ color: "#0A0A0A" }} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.filter((i) => !i.locked).map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn("flex items-center gap-3 px-3 py-3 rounded-xl text-[14px]")
                      }
                      style={({ isActive }) => ({
                        background: isActive ? "#0A0A0A" : "transparent",
                        color: isActive ? "#FAFAF8" : "#0A0A0A",
                      })}
                    >
                      <Icon size={18} />
                      {item.label}
                    </NavLink>
                  );
                })}
                {isAdmin && (
                  <NavLink
                    to="/dashboard/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] mt-2 pt-3 border-t"
                    style={{ color: "#0A0A0A", borderColor: "rgba(10,10,10,0.08)" }}
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
        {/* Topbar */}
        <header
          className="flex items-center gap-3 h-16 px-4 md:px-6 border-b shrink-0"
          style={{ borderColor: "rgba(10,10,10,0.08)", background: "#F5F5F3" }}
        >
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={22} style={{ color: "#0A0A0A" }} />
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border bg-white/60"
              style={{ borderColor: "rgba(10,10,10,0.08)" }}
            >
              <Search size={15} className="opacity-50 shrink-0" />
              <input
                placeholder="Search chapters, topics..."
                className="w-full bg-transparent outline-none text-[13.5px]"
                style={{ color: "#0A0A0A" }}
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2 ml-auto">
            {/* Streak badge */}
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium"
              style={{ background: "#D4FF00", color: "#0A0A0A" }}
            >
              🔥 {user?.streak ?? 0}
            </div>

            {/* Class dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setClassMenuOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px]"
                style={{ borderColor: "rgba(10,10,10,0.1)", color: "#0A0A0A" }}
              >
                Class {classLevel || "12"}
                <ChevronDown size={13} />
              </button>
              <AnimatePresence>
                {classMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-28 rounded-xl border shadow-lg overflow-hidden z-10"
                    style={{ background: "#FAFAF8", borderColor: "rgba(10,10,10,0.08)" }}
                  >
                    {["9", "10", "11", "12"].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setClassLevel(c);
                          setClassMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-black/[0.04]"
                        style={{ color: "#0A0A0A" }}
                      >
                        Class {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ask CTA */}
            <NavLink
              to="/dashboard/approach"
              className="px-4 py-2 rounded-full text-[13px] font-medium"
              style={{ background: "#D4FF00", color: "#0A0A0A" }}
            >
              Ask
            </NavLink>

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04]"
            >
              <Bell size={17} style={{ color: "#0A0A0A" }} />
            </button>

            {/* Messages */}
            <NavLink
              to="/dashboard/community?tab=chat"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04]"
            >
              <MessageCircle size={17} style={{ color: "#0A0A0A" }} />
            </NavLink>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/[0.04]"
            >
              {theme === "dark" ? (
                <Sun size={17} style={{ color: "#0A0A0A" }} />
              ) : (
                <Moon size={17} style={{ color: "#0A0A0A" }} />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* ---------- Notifications modal ---------- */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-start justify-center pt-24"
            onClick={() => setNotifOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[92%] max-w-sm rounded-2xl border shadow-xl overflow-hidden"
              style={{ background: "#FAFAF8", borderColor: "rgba(10,10,10,0.08)" }}
            >
              <div
                className="px-4 py-3 border-b flex items-center justify-between"
                style={{ borderColor: "rgba(10,10,10,0.08)" }}
              >
                <h3
                  className="text-[15px]"
                  style={{ fontFamily: "'Fraunces', serif", color: "#0A0A0A" }}
                >
                  Notifications
                </h3>
                <button onClick={() => setNotifOpen(false)}>
                  <X size={16} style={{ color: "#0A0A0A" }} />
                </button>
              </div>
              <div className="p-6 text-center text-[13px] opacity-50">
                You're all caught up.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
