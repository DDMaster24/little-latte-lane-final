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
        className="bg-darkBg text-neonText py-3 px-4 lg:py-4 lg:px-6 flex items-center justify-between shadow-neon relative z-40"
        suppressHydrationWarning={true}
      >
        <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
          <Image
            src="/images/logo.png"
            alt="Little Latte Lane Logo"
            width={60}
            height={60}
            className="lg:w-[100px] lg:h-[100px] shadow-neon flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent truncate">
              Little Latte Lane
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-300 truncate">Roberts&apos; Cafe and Deli</p>
          </div>
        </div>

        <div className="hidden md:flex flex-grow justify-center">
          <nav className="flex items-center space-x-6">
            <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
            <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
            <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
          </nav>
        </div>

        <div className="flex items-center justify-end w-60">
          <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-darkBg text-neonText py-4 px-6 flex items-center justify-between shadow-neon relative">
      {/* Left Section - Logo + Title */}
      <div className="flex items-center ml-4">
        <Image
          src="/images/logo.png"
          alt="Little Latte Lane Logo"
          width={100}
          height={100}
          className="mr-8 shadow-neon"
        />
        <div>
          <h1 className="text-4xl font-bold bg-neon-gradient">
            Little Latte Lane
          </h1>
          <p className="text-base">Roberts&apos; Cafe and Deli</p>
        </div>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="hidden md:flex flex-grow justify-center">
        <nav className="flex items-center space-x-6">
          <Link href="/" className="neon-button">
            Home
          </Link>
          <Link href="/menu" className="neon-button">
            Menu
          </Link>
          <Link href="/bookings" className="neon-button">
            Bookings
          </Link>
          <Link href="/account" className="neon-button">
            My Account
          </Link>
          {user && profile?.role === 'admin' && (
            <Link href="/admin" className="neon-button">
              Admin Panel
            </Link>
          )}
          {user && profile?.role === 'staff' && (
            <Link href="/staff" className="neon-button">
              Staff Panel
            </Link>
          )}
        </nav>
      </div>

      {/* Right Section - Auth Area */}
      <div className="flex items-center justify-end w-60">
        {user ? (
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center border-2 border-neonCyan shadow-neon">
                <span className="text-black font-bold text-sm">
                  {(profile?.username || user.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex flex-col text-sm">
              <span className="text-gray-400">Signed in as</span>
              <span className="text-white font-medium">
                {profile?.username || user.email}
              </span>
            </div>
            <Button onClick={signOut} className="neon-button bg-neonPink ml-2">
              Logout
            </Button>
          </div>
        ) : (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="neon-button">Login</Button>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 backdrop-blur-md bg-black/30" />
            <DialogContent className="bg-white/40 backdrop-blur-sm border border-orange-500/50 rounded-2xl shadow-[0_0_15px_rgba(255,165,0,0.7)]">
              <DialogHeader>
                <DialogTitle className="text-white text-lg">
                  Login or Signup
                </DialogTitle>
              </DialogHeader>
              <LoginForm setIsModalOpen={setIsModalOpen} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-neonCyan hover:text-neonPink hover:shadow-neon" />
          ) : (
            <Menu className="h-6 w-6 text-neonCyan hover:text-neonPink hover:shadow-neon" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="absolute top-full left-0 w-full bg-darkBg/95 backdrop-blur-md shadow-neon md:hidden flex flex-col space-y-3 py-4 z-50 border-t border-neonCyan/30 animate-slide-up">
          <Link
            href="/"
            className="neon-button mx-4 text-center py-3 hover:bg-neonCyan/10 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🏠 Home
          </Link>
          <Link
            href="/menu"
            className="neon-button mx-4 text-center py-3 hover:bg-neonCyan/10 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            🍽️ Menu
          </Link>
          <Link
            href="/bookings"
            className="neon-button mx-4 text-center py-3 hover:bg-neonCyan/10 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            📅 Bookings
          </Link>
          <Link
            href="/account"
            className="neon-button mx-4 text-center py-3 hover:bg-neonCyan/10 rounded-lg transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            👤 My Account
          </Link>
          {user && profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="neon-button mx-4 text-center py-3 hover:bg-neonPink/10 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ⚙️ Admin Panel
            </Link>
          )}
          {user && profile?.role === 'staff' && (
            <Link
              href="/staff"
              className="neon-button mx-4 text-center py-3 hover:bg-neonBlue/10 rounded-lg transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              👨‍🍳 Staff Panel
            </Link>
          )}
          
          {/* Mobile Auth Section */}
          <div className="mx-4 pt-3 border-t border-gray-700">
            {user ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neonCyan to-neonPink flex items-center justify-center">
                    <span className="text-black font-bold text-xs">
                      {(profile?.username || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-neonText">
                    {profile?.username || user.email}
                  </span>
                </div>
                <Button 
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="neon-button bg-neonPink w-full py-2"
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
                className="neon-button w-full py-3"
              >
                Login
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
