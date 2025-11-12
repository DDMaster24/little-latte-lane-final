'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside both the dropdown trigger AND the dropdown menu
      const isOutsideDropdownTrigger = !target.closest('.nav-dropdown-container');
      const isOutsideDropdownMenu = !target.closest('.nav-dropdown-menu');
      
      if (isNavDropdownOpen && isOutsideDropdownTrigger && isOutsideDropdownMenu) {
        setIsNavDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNavDropdownOpen]);

  // Get current page name based on pathname
  const getCurrentPageName = () => {
    if (pathname === '/') return 'Home';
    if (pathname?.startsWith('/menu')) return 'Menu';
    if (pathname?.startsWith('/bookings')) return 'Bookings';
    if (pathname?.startsWith('/account')) return 'My Account';
    if (pathname?.startsWith('/admin')) return 'Admin Panel';
    if (pathname?.startsWith('/staff')) {
      if (pathname.includes('kitchen-view')) return 'Kitchen View';
      return 'Staff Panel';
    }
    return 'Home';
  };

  // Get navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', emoji: '🏠' },
      { href: '/menu', label: 'Menu', emoji: '🍽️' },
      { href: '/bookings', label: 'Bookings', emoji: '📅' },
      { href: '/account', label: 'My Account', emoji: '👤' },
    ];

    if (user && profile?.is_admin) {
      baseItems.push({ href: '/admin', label: 'Admin Panel', emoji: '⚙️' });
    }

    if (user && (profile?.is_staff || profile?.is_admin)) {
      const staffHref = profile?.is_staff && !profile?.is_admin ? '/staff/kitchen-view' : '/staff';
      const staffLabel = profile?.is_staff && !profile?.is_admin ? 'Kitchen View' : 'Staff Panel';
      baseItems.push({ href: staffHref, label: staffLabel, emoji: '🍳' });
    }

    return baseItems;
  };

  // Don't render auth-dependent content until mounted
  if (!mounted) {
    return (
      <header
        className="bg-darkBg text-neonText fixed top-0 left-0 right-0 z-50 border-b border-neonCyan/30"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: '#0D0D0D', // Extends into status bar area
        }}
        suppressHydrationWarning={true}
      >
        <div className="container-full flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <Image
              src="/images/logo.svg"
              alt="Little Latte Lane - Café and Deli"
              width={120}
              height={60}
              className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36"
              priority
            />
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
      className="bg-darkBg text-neonText fixed top-0 left-0 right-0 z-50 border-b-2 border-neonCyan/30 shadow-[0_4px_20px_rgba(0,217,255,0.15)]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        backgroundColor: '#0D0D0D', // Extends into status bar area
      }}
    >
      <div className="container-full flex items-center justify-between">
        
        {/* Left Section - Little Latte Lane Logo */}
        <div className="flex items-center min-w-0">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="Little Latte Lane - Café and Deli"
              width={120}
              height={60}
              className="w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 flex items-center justify-center"
              priority
            />
          </Link>
        </div>

        {/* Center Section - Desktop Navigation (when logged in) */}
        {user && (
          <>
            {/* Desktop: Traditional Navigation Buttons */}
            <div className="hidden lg:flex items-center">
              <nav className="flex items-center space-x-3 xl:space-x-4">
                {getNavItems().map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="neon-button text-sm px-3 py-2"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile: Dropdown Navigation */}
            <div className="flex-1 mx-2 xs:mx-4 flex items-center gap-2 lg:hidden">
              {/* Navigation Dropdown - Shorter width, exact height */}
              <div className="flex-1 max-w-[160px] xs:max-w-[180px] nav-dropdown-container relative">
                <button
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className="w-full px-2.5 py-2 xs:px-3 xs:py-2 rounded-lg border-2 border-neonCyan/50 bg-darkBg/80 backdrop-blur-sm hover:border-neonPink/70 hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] transition-all duration-300 flex items-center justify-between group"
                >
                  <span className="text-neonCyan text-xs font-semibold group-hover:text-neonPink transition-colors truncate">
                    {getCurrentPageName()}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-neonCyan group-hover:text-neonPink transition-all duration-300 flex-shrink-0 ml-1.5 ${isNavDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </div>

              {/* Logout Button - Regular button (not Button component) to match exact height */}
              <button 
                onClick={signOut} 
                className="neon-button bg-neonPink text-white text-[10px] xs:text-xs px-2 py-0.5 xs:px-2.5 xs:py-1 whitespace-nowrap rounded-lg border-2 border-neonPink/50 hover:border-neonPink hover:shadow-[0_0_10px_rgba(255,0,255,0.5)] transition-all duration-300 font-medium"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {/* Navigation Dropdown - Outside header container to expand over page */}
        {user && isNavDropdownOpen && (
          <div className="nav-dropdown-menu fixed left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-64 top-[calc(env(safe-area-inset-top)+5rem)] sm:top-[calc(env(safe-area-inset-top)+6rem)] bg-darkBg/95 backdrop-blur-md border-2 border-neonCyan/50 rounded-lg shadow-[0_0_20px_rgba(0,217,255,0.3)] z-50 animate-slide-up lg:hidden">
            <div className="p-2 space-y-1">
              {getNavItems().map((item) => (
                <button
                  key={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsNavDropdownOpen(false);
                    router.push(item.href);
                  }}
                  className={`w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                      ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/50 shadow-[0_0_10px_rgba(0,217,255,0.3)]'
                      : 'hover:bg-neonCyan/10 text-gray-300 hover:text-neonCyan hover:shadow-[0_0_5px_rgba(0,217,255,0.2)]'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center Section - Navigation Links (Desktop - when not logged in) */}
        {!user && (
          <div className="hidden lg:flex items-center">
            <nav className="flex items-center space-x-3 xl:space-x-4">
              <Link 
                href="/" 
                className="neon-button text-sm px-3 py-2"
              >
                Home
              </Link>
              <Link 
                href="/menu" 
                className="neon-button text-sm px-3 py-2"
              >
                Menu
              </Link>
              <Link 
                href="/bookings" 
                className="neon-button text-sm px-3 py-2"
              >
                Bookings
              </Link>
            </nav>
          </div>
        )}

        {/* Right Section - Auth Area */}
        <div className="flex items-center justify-end space-x-2 xs:space-x-3 min-w-0">
          {user ? (
            <>
              {/* Mobile: Profile icon only */}
              <div className="lg:hidden">
                <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                  <span className="text-black font-bold text-xs xs:text-sm">
                    {(profile?.full_name || user.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Desktop: Stacked layout - Profile on top, Logout below */}
              <div className="hidden lg:flex flex-col items-center gap-1.5">
                {/* Profile Picture - On top */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                    <span className="text-black font-bold text-sm">
                      {(profile?.full_name || user.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Logout Button - Below profile, matching dropdown height */}
                <Button 
                  onClick={signOut} 
                  className="neon-button bg-neonPink text-xs px-3 py-2.5 whitespace-nowrap"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="neon-button text-xs xs:text-sm px-3 xs:px-4 py-2"
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 backdrop-blur-md bg-black/60" />
                <DialogContent className="bg-darkBg/95 backdrop-blur-sm border-2 border-neonCyan/50 rounded-2xl shadow-[0_0_20px_rgba(0,217,255,0.5)] w-[calc(100%-2rem)] max-w-[400px] sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle className="text-neonCyan text-fluid-lg font-bold">
                      Login or Signup
                    </DialogTitle>
                  </DialogHeader>
                  <LoginForm setIsModalOpen={setIsModalOpen} />
                </DialogContent>
              </Dialog>

              {/* Hamburger Menu - Only when not logged in */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className="p-2"
                >
                  {isNavDropdownOpen ? (
                    <X className="h-5 w-5 xs:h-6 xs:w-6 text-neonCyan hover:text-neonPink hover:shadow-neon transition-colors" />
                  ) : (
                    <Menu className="h-5 w-5 xs:h-6 xs:w-6 text-neonCyan hover:text-neonPink hover:shadow-neon transition-colors" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown - Only when not logged in */}
      {!user && isNavDropdownOpen && (
        <nav className="absolute top-full left-0 right-0 bg-darkBg/95 backdrop-blur-md lg:hidden border-t border-neonCyan/30 animate-slide-up z-50 shadow-[0_4px_20px_rgba(0,217,255,0.15)]">
          <div className="container-wide py-4 space-y-1">
            <Link
              href="/"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsNavDropdownOpen(false)}
            >
              🏠 Home
            </Link>
            <Link
              href="/menu"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsNavDropdownOpen(false)}
            >
              🍽️ Menu
            </Link>
            <Link
              href="/bookings"
              className="neon-button w-full text-center py-3 xs:py-4 hover:bg-neonCyan/10 hover:shadow-[0_0_10px_rgba(0,217,255,0.3)] rounded-lg transition-all duration-300 touch-target text-fluid-sm flex items-center justify-center gap-2"
              onClick={() => setIsNavDropdownOpen(false)}
            >
              📅 Bookings
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
