"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Pill,
  LayoutDashboard,
  LogOut,
  User,
  Settings,
  ShieldCheck,
} from "lucide-react";
import "./navbar.css";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { getInitials } from "@/lib/utils/index";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/medicines", label: "Medicines" },
  { href: "/pharmacies", label: "Pharmacies" },
];

const authLinks = [
  { href: "/", label: "Home" },
  { href: "/medicines", label: "Medicines" },
  { href: "/pharmacies", label: "Pharmacies" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const links = session ? authLinks : publicLinks;
  const user = session?.user;

  function getDashboardHref() {
    const role = (user as any)?.role;
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "PHARMACY") return "/pharmacy/dashboard";
    if (role === "STAFF") return "/staff/dashboard";
    return "/user/dashboard";
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <Pill size={20} />
          </span>
          <span className="navbar-logo-text">
            Medi<strong>Track</strong>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link${pathname === link.href ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="navbar-right">
          <ThemeToggle />

          {user ? (
            <div className="navbar-profile-wrap">
              <button
                className="navbar-profile-btn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
              >
                <span className="navbar-avatar">
                  {user.image ? (
                    <img src={user.image} alt={user.name} />
                  ) : (
                    <span className="navbar-avatar-initials">
                      {getInitials(user.name)}
                    </span>
                  )}
                </span>
                <span className="navbar-profile-name">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  size={14}
                  className={`navbar-chevron${profileOpen ? " open" : ""}`}
                />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="navbar-overlay"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">{user.name}</p>
                      <p className="navbar-dropdown-email">{user.email}</p>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link
                      href={getDashboardHref()}
                      className="navbar-dropdown-item"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <Link
                      href={`/${(user as any)?.role?.toLowerCase() ?? "user"}/profile`}
                      className="navbar-dropdown-item"
                    >
                      <User size={15} />
                      My profile
                    </Link>
                    {(user as any)?.role === "ADMIN" && (
                      <Link
                        href="/dashboard/admin/settings"
                        className="navbar-dropdown-item"
                      >
                        <ShieldCheck size={15} />
                        Admin panel
                      </Link>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button
                      className="navbar-dropdown-item logout"
                      onClick={handleSignOut}
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="navbar-auth">
              <Link href="/login" className="navbar-btn-ghost">
                Sign in
              </Link>
              <Link href="/register" className="navbar-btn-primary">
                Get started
              </Link>
            </div>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-mobile-link${pathname === link.href ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <div className="navbar-mobile-divider" />
              <Link href={getDashboardHref()} className="navbar-mobile-link">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button
                className="navbar-mobile-link logout"
                onClick={handleSignOut}
              >
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <div className="navbar-mobile-divider" />
              <Link href="/login" className="navbar-mobile-link">
                Sign in
              </Link>
              <Link href="/register" className="navbar-mobile-link active">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
