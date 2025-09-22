'use client'

import React from 'react'
import Link from 'next/link'
import { useRestaurantClosure } from '@/hooks/useRestaurantClosure'
import { AlertCircle, Clock, Calendar, PowerOff, Home } from 'lucide-react'

interface MenuClosurePageProps {
  className?: string
}

export default function MenuClosurePage({ className = '' }: MenuClosurePageProps) {
  const { closureStatus, isClosed } = useRestaurantClosure()

  if (!isClosed) {
    return null
  }

  const getClosureIcon = () => {
    switch (closureStatus.reason) {
      case 'scheduled':
        return <Calendar className="h-16 w-16 text-orange-400" />
      case 'manual': 
        return <PowerOff className="h-16 w-16 text-red-400" />
      default:
        return <AlertCircle className="h-16 w-16 text-red-400" />
    }
  }

  const getClosureColor = () => {
    switch (closureStatus.reason) {
      case 'scheduled':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-500/40'
      case 'manual':
        return 'from-red-500/20 to-pink-500/20 border-red-500/40'
      default:
        return 'from-red-500/20 to-red-600/20 border-red-500/40'
    }
  }

  const getClosureTitle = () => {
    switch (closureStatus.reason) {
      case 'scheduled':
        return 'We\'re Temporarily Closed'
      case 'manual':
        return 'Currently Closed'
      default:
        return 'We\'re Currently Closed'
    }
  }

  const formatReopeningTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Soon'
    }
  }

  return (
    <main className={`bg-darkBg min-h-screen flex items-center justify-center px-4 py-8 ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0, 255, 255, 0.3) 2px, transparent 0),
                           radial-gradient(circle at 75px 75px, rgba(255, 0, 255, 0.3) 2px, transparent 0)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Main Closure Card */}
        <div className={`bg-gradient-to-br ${getClosureColor()} backdrop-blur-md border-2 rounded-2xl p-8 md:p-12 mb-8 shadow-2xl`}>
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getClosureIcon()}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {getClosureTitle()}
          </h1>

          {/* Message */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {closureStatus.message || 'We are temporarily closed. Please check back later.'}
          </p>

          {/* Reopening Info */}
          {closureStatus.reason === 'scheduled' && closureStatus.scheduled_end && (
            <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="h-6 w-6 text-green-400" />
                <h3 className="text-xl font-semibold text-green-400">Reopening Soon</h3>
              </div>
              <p className="text-lg text-white">
                {formatReopeningTime(closureStatus.scheduled_end)}
              </p>
            </div>
          )}

          {/* Status Points */}
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300 mb-8">
            <div className="flex items-center justify-center gap-2 p-3 bg-black/20 rounded-lg">
              <PowerOff className="h-4 w-4 text-red-400" />
              <span>Online ordering disabled</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-black/20 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span>Please check back later</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 bg-black/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <span>Thank you for your patience</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-neonCyan/20 border border-neonCyan/40 text-neonCyan rounded-xl hover:bg-neonCyan/30 hover:border-neonCyan/60 transition-all duration-300 font-semibold group"
            >
              <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Return to Homepage
            </Link>
            
            <Link
              href="/bookings"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-neonPink/20 border border-neonPink/40 text-neonPink rounded-xl hover:bg-neonPink/30 hover:border-neonPink/60 transition-all duration-300 font-semibold group"
            >
              <Calendar className="h-5 w-5 group-hover:scale-110 transition-transform" />
              View Bookings
            </Link>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-neonCyan mb-4">Alternative Options</h3>
          <div className="grid md:grid-cols-2 gap-4 text-gray-300">
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Call Us Directly</h4>
              <p className="text-sm">Contact us for special orders or inquiries</p>
              <p className="text-neonCyan font-mono mt-2">+27 123 456 789</p>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Follow Updates</h4>
              <p className="text-sm">Stay informed about our reopening status</p>
              <p className="text-neonPink mt-2">@LittleLatteLane</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-neonCyan/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neonPink/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </main>
  )
}