'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
} from '@/components/ui/dialog';
import LoginForm from '@/components/LoginForm';
import { useHeaderLogo } from '@/hooks/useHeaderLogo';

export default function Header() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { logoUrl, isLoading: logoLoading } = useHeaderLogo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add effect to trigger profile refresh if user exists but profile is missing
  useEffect(() => {
    if (user && !profile && !authLoading) {
      console.log('🔄 Header: User exists but no profile, this might indicate a role loading issue');
      // The AuthProvider should handle this, but we can add logging here for debugging
    }
  }, [user, profile, authLoading]);

  // Don't render auth-dependent content until mounted
  if (!mounted) {
    return (
      <header
        className="bg-darkBg text-neonText py-2 xs:py-3 shadow-neon relative z-40"
        suppressHydrationWarning={true}
      >
        <div className="container-full flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700 animate-pulse rounded"></div>
          </div>

          <div className="hidden lg:flex items-center">
            <nav className="flex items-center space-x-3 xl:space-x-4">
              <div className="w-12 h-6 bg-gray-700 animate-pulse rounded"></div>
              <div className="w-12 h-6 bg-gray-700 animate-pulse rounded"></div>
              <div className="w-16 h-6 bg-gray-700 animate-pulse rounded"></div>
            </nav>
          </div>

          <div className="flex items-center justify-end space-x-2 xs:space-x-3">
            <div className="w-16 xs:w-20 h-6 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      data-editable="header-background"
      className="bg-darkBg text-neonText py-2 xs:py-3 shadow-neon relative z-40"
    >
      <div className="container-full flex items-center justify-between">
        
        {/* Left Section - Seamless Logo */}
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center">
            {logoLoading ? (
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700 animate-pulse rounded"></div>
            ) : logoUrl ? (
              <Image
                data-editable="header-logo"
                src={logoUrl}
                alt="Robert's Little Latte Lane Café & Deli"
                width={200}
                height={200}
                className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                priority
                quality={95}
                style={{
                  background: 'transparent',
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.1) saturate(1.1)',
                  borderRadius: '8px',
                  padding: '2px'
                }}
              />
            ) : (
              <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700 rounded"></div>
            )}
          </Link>
        </div>

        {/* Center Section - Navigation Links - Hidden on Mobile */}
        <div className="hidden lg:flex items-center">
          <nav className="flex items-center space-x-3 xl:space-x-4">
            <Link 
              href="/" 
              data-editable="nav-link-home"
              className="neon-button text-sm px-3 py-2"
            >
              Home
            </Link>
            <Link 
              href="/menu" 
              data-editable="nav-link-menu"
              className="neon-button text-sm px-3 py-2"
            >
              Menu
            </Link>
            <Link 
              href="/bookings" 
              data-editable="nav-link-bookings"
              className="neon-button text-sm px-3 py-2"
            >
              Bookings
            </Link>
            <Link 
              href="/account" 
              data-editable="nav-link-account"
              className="neon-button text-sm px-3 py-2"
            >
              My Account
            </Link>
            {user && profile?.is_admin && (
              <Link 
                href="/admin" 
                data-editable="nav-link-admin"
                className="neon-button text-sm px-3 py-2"
              >
                Admin Panel
              </Link>
            )}
            {user && (profile?.is_staff || profile?.is_admin) && (
              <Link 
                href={profile?.is_staff && !profile?.is_admin ? "/staff/kitchen-view" : "/staff"} 
                data-editable="nav-link-staff"
                className="neon-button text-sm px-3 py-2"
              >
                {profile?.is_staff && !profile?.is_admin ? "🍳 Kitchen" : "Staff Panel"}
              </Link>
            )}
            {user && !profile && authLoading && (
              <div className="text-xs text-gray-400 px-3 py-2">
                Loading roles...
              </div>
            )}
          </nav>
        </div>

        {/* Right Section - Auth Area - Compact */}
        <div className="flex items-center justify-end space-x-2 xs:space-x-3 min-w-0">
          {user ? (
            <div className="flex items-center space-x-2">
              {/* Profile Picture - Compact */}
              <div className="relative">
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                  <span className="text-black font-bold text-xs xs:text-sm">
                    {(profile?.full_name || user.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* User Info - Hidden on small screens */}
              <div className="hidden md:flex flex-col text-xs min-w-0">
                <span className="text-gray-400 truncate">Signed in</span>
                <span className="text-white font-medium truncate max-w-28 lg:max-w-32">
                  {profile?.full_name || user.email}
                </span>
              </div>
              
              <Button 
                onClick={signOut} 
                data-editable="auth-logout-button"
                className="neon-button bg-neonPink text-xs px-3 py-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          ) : (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-editable="auth-login-button"
                  className="neon-button text-xs xs:text-sm px-3 xs:px-4 py-2"
                >
                  Login
                </Button>
              </DialogTrigger>
              <DialogOverlay className="fixed inset-0 backdrop-blur-md bg-black/30" />
              <DialogContent className="bg-white/40 backdrop-blur-sm border border-orange-500/50 rounded-2xl shadow-[0_0_15px_rgba(255,165,0,0.7)] max-w-sm xs:max-w-md sm:max-w-lg mx-4">
                <DialogHeader>
                  <DialogTitle className="text-white text-fluid-lg">
                    Login or Signup
                  </DialogTitle>
                </DialogHeader>
                <LoginForm setIsModalOpen={setIsModalOpen} />
              </DialogContent>
            </Dialog>
          )}

          {/* Hamburger Menu for Mobile/Tablet */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 xs:h-6 xs:w-6 text-neonCyan hover:text-neonPink hover:shadow-neon transition-colors" />
              ) : (
                <Menu className="h-5 w-5 xs:h-6 xs:w-6 text-neonCyan hover:text-neonPink hover:shadow-neon transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Enhanced Responsive */}
      {isMobileMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-darkBg/95 backdrop-blur-md shadow-neon lg:hidden border-t border-neonCyan/30 animate-slide-up z-50">
          <div className="container-wide py-4 space-y-1">
            <Link
              href="/"
              data-editable="mobile-nav-home"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>
            <Link
              href="/menu"
              data-editable="mobile-nav-menu"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🍽️ Menu
            </Link>
            <Link
              href="/bookings"
              data-editable="mobile-nav-bookings"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              📅 Bookings
            </Link>
            <Link
              href="/account"
              data-editable="mobile-nav-account"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              👤 My Account
            </Link>
            {user && profile?.is_admin && (
              <Link
                href="/admin"
                className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonPink/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚙️ Admin Panel
              </Link>
            )}
            {user && (profile?.is_staff || profile?.is_admin) && (
              <Link
                href={profile?.is_staff && !profile?.is_admin ? "/staff/kitchen-view" : "/staff"}
                className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonBlue/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {profile?.is_staff && !profile?.is_admin ? "🍳 Kitchen View" : "👨‍🍳 Staff Panel"}
              </Link>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-700/50 mt-4">
              {user ? (
                <div className="flex items-center space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan">
                      <span className="text-black font-bold text-xs xs:text-sm">
                        {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Signed in as</p>
                      <p className="text-neonText text-fluid-sm font-medium truncate max-w-40">
                        {profile?.full_name || user.email}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="neon-button bg-neonPink w-full py-3 xs:py-4 touch-target text-fluid-sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }} 
                  className="neon-button w-full py-3 xs:py-4 touch-target text-fluid-sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
