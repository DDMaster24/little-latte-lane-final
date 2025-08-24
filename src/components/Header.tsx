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

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render auth-dependent content until mounted
  if (!mounted) {
    return (
      <header
        className="bg-darkBg text-neonText section-padding-sm shadow-neon relative z-40"
        suppressHydrationWarning={true}
      >
        <div className="container-wide flex items-center justify-between">
          <div className="flex items-center space-x-3 xs:space-x-4 sm:space-x-6 lg:space-x-8 min-w-0 flex-1 max-w-md">
            <Image
              src="/images/logo.png"
              alt="Little Latte Lane Logo"
              width={60}
              height={60}
              className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 shadow-neon flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl lg:text-fluid-3xl xl:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent truncate">
                Little Latte Lane
              </h1>
              <p className="text-fluid-xs xs:text-fluid-sm sm:text-fluid-base text-gray-300 truncate">Roberts&apos; Cafe and Deli</p>
            </div>
          </div>

          <div className="hidden lg:flex flex-grow justify-center max-w-2xl">
            <nav className="flex items-center space-x-4 xl:space-x-6">
              <div className="w-12 h-8 bg-gray-700 animate-pulse rounded"></div>
              <div className="w-12 h-8 bg-gray-700 animate-pulse rounded"></div>
              <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
            </nav>
          </div>

          <div className="flex items-center justify-end space-x-2 xs:space-x-3 sm:space-x-4">
            <div className="w-16 xs:w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-darkBg text-neonText section-padding-sm shadow-neon relative z-40">
      <div className="container-wide flex items-center justify-between">
        
        {/* Left Section - Logo + Title - Responsive Sizing */}
        <div className="flex items-center space-x-3 xs:space-x-4 sm:space-x-6 lg:space-x-8 min-w-0 flex-1 max-w-md">
          <Image
            src="/images/logo.png"
            alt="Little Latte Lane Logo"
            width={60}
            height={60}
            className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 shadow-neon flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-fluid-lg xs:text-fluid-xl sm:text-fluid-2xl lg:text-fluid-3xl xl:text-fluid-4xl font-bold bg-neon-gradient bg-clip-text text-transparent truncate">
              Little Latte Lane
            </h1>
            <p className="text-fluid-xs xs:text-fluid-sm sm:text-fluid-base text-gray-300 truncate">
              Roberts&apos; Cafe and Deli
            </p>
          </div>
        </div>

        {/* Center Section - Navigation Links - Hidden on Mobile */}
        <div className="hidden lg:flex flex-grow justify-center max-w-2xl">
          <nav className="flex items-center space-x-4 xl:space-x-6">
            <Link href="/" className="neon-button touch-target">
              Home
            </Link>
            <Link href="/menu" className="neon-button touch-target">
              Menu
            </Link>
            <Link href="/bookings" className="neon-button touch-target">
              Bookings
            </Link>
            <Link href="/account" className="neon-button touch-target">
              My Account
            </Link>
            {user && profile?.is_admin && (
              <Link href="/admin" className="neon-button touch-target">
                Admin Panel
              </Link>
            )}
            {user && (profile?.is_staff || profile?.is_admin) && (
              <Link href="/staff" className="neon-button touch-target">
                Staff Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section - Auth Area - Responsive */}
        <div className="flex items-center justify-end space-x-2 xs:space-x-3 sm:space-x-4 min-w-0">
          {user ? (
            <div className="flex items-center space-x-2 xs:space-x-3">
              {/* Profile Picture - Responsive Sizing */}
              <div className="relative">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                  <span className="text-black font-bold text-xs xs:text-sm sm:text-base">
                    {(profile?.full_name || user.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* User Info - Hidden on xs screens */}
              <div className="hidden sm:flex flex-col text-xs sm:text-sm min-w-0">
                <span className="text-gray-400 truncate">Signed in as</span>
                <span className="text-white font-medium truncate max-w-32 lg:max-w-48">
                  {profile?.full_name || user.email}
                </span>
              </div>
              
              <Button 
                onClick={signOut} 
                className="neon-button bg-neonPink touch-target text-xs xs:text-sm px-2 xs:px-3 sm:px-4"
              >
                <span className="hidden xs:inline">Logout</span>
                <span className="xs:hidden">Exit</span>
              </Button>
            </div>
          ) : (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="neon-button touch-target text-xs xs:text-sm px-3 xs:px-4 sm:px-6">
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
              className="touch-target p-2"
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
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🏠 Home
            </Link>
            <Link
              href="/menu"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              🍽️ Menu
            </Link>
            <Link
              href="/bookings"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              📅 Bookings
            </Link>
            <Link
              href="/account"
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
                href="/staff"
                className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonBlue/10 rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👨‍🍳 Staff Panel
              </Link>
            )}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-700/50 mt-4">
              {user ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan">
                      <span className="text-black font-bold text-sm xs:text-base">
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
