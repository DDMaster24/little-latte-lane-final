'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useHeaderLogo } from '@/hooks/useHeaderLogo';

// Clean static version of Header component for editor - uses DIV instead of HEADER tag
export default function StaticHeaderForEditor() {
  const { logoUrl, isLoading } = useHeaderLogo();
  
  return (
    <div className="w-full">
      {/* Main Header - Using DIV instead of HEADER tag to fix rendering issue */}
      <div className="bg-darkBg text-neonText py-3 xs:py-4 shadow-neon relative z-40">
        <div className="container-full flex items-center justify-between">
          
          {/* Left Section - Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center">
              {isLoading ? (
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700 animate-pulse rounded"></div>
              ) : logoUrl ? (
                <Image
                  data-editable="header-logo"
                  src={logoUrl}
                  alt="Robert's Little Latte Lane Café & Deli"
                  width={200}
                  height={200}
                  className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain mix-blend-screen"
                  priority
                  quality={95}
                  style={{
                    background: 'transparent',
                    imageRendering: 'crisp-edges',
                    filter: 'brightness(1.1) contrast(1.1)'
                  }}
                />
              ) : (
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-700 rounded"></div>
              )}
            </Link>
          </div>

          {/* Center Section - Navigation Links */}
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
              <Link 
                href="/admin" 
                data-editable="nav-link-admin"
                className="neon-button text-sm px-3 py-2"
              >
                Admin Panel
              </Link>
            </nav>
          </div>

          {/* Right Section - Auth Area */}
          <div className="flex items-center justify-end space-x-2 xs:space-x-3 min-w-0">
            <div className="flex items-center space-x-2">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                  <span className="text-black font-bold text-xs xs:text-sm">
                    D
                  </span>
                </div>
              </div>
              
              {/* User Info */}
              <div className="hidden md:flex flex-col text-xs min-w-0">
                <span className="text-gray-400 truncate">Signed in</span>
                <span className="text-white font-medium truncate max-w-28 lg:max-w-32" data-editable="user-display-name">
                  Admin User
                </span>
              </div>
              
              <button 
                data-editable="auth-logout-button"
                className="neon-button bg-neonPink text-xs px-3 py-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>

            {/* Hamburger Menu for Mobile/Tablet */}
            <div className="lg:hidden">
              <button className="p-2">
                <svg className="h-5 w-5 xs:h-6 xs:w-6 text-neonCyan hover:text-neonPink transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Hidden by default */}
        <nav className="hidden absolute top-full left-0 right-0 bg-darkBg/95 backdrop-blur-md shadow-neon lg:hidden border-t border-neonCyan/30 z-50">
          <div className="container-wide py-4 space-y-1">
            <Link
              href="/"
              data-editable="mobile-nav-home"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              🏠 Home
            </Link>
            <Link
              href="/menu"
              data-editable="mobile-nav-menu"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              🍽️ Menu
            </Link>
            <Link
              href="/bookings"
              data-editable="mobile-nav-bookings"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              📅 Bookings
            </Link>
            <Link
              href="/account"
              data-editable="mobile-nav-account"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
            >
              👤 My Account
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}