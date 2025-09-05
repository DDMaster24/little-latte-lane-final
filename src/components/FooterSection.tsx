'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-darkBg text-neonText border-t-4 border-neonCyan shadow-neon">
      <div className="container-responsive section-padding-sm">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8">
          {/* Contact - Responsive Layout */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Contact Number:
            </h3>
            <p className="text-fluid-sm xs:text-fluid-base">+27 (0)12 345 6789</p>
            <p className="text-fluid-xs text-gray-400 mt-2">Opening Hours:</p>
            <div className="text-fluid-xs xs:text-fluid-sm space-y-1">
              <p>Mon - Fri: 6:00 AM - 6:00 PM</p>
              <p>Sat: 8:00 AM - 3:00 PM</p>
              <p>Sun: 8:00 AM - 1:00 PM</p>
            </div>
          </div>

          {/* Location - Responsive Layout */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Location:
            </h3>
            <p className="text-fluid-sm xs:text-fluid-base">11 Aristea Crescent</p>
            <p className="text-fluid-sm xs:text-fluid-base">Roberts Estate</p>
            <p className="text-fluid-sm xs:text-fluid-base">Middleburg 1050</p>
            <p className="text-fluid-xs text-gray-400 mt-2">South Africa</p>
          </div>

          {/* Social Links - Modern Icons and Better Alignment */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Connect With Us:
            </h3>
            <ul className="space-y-3 xs:space-y-4">
              <li>
                <a
                  href="https://facebook.com/littlelattelane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonCyan hover:shadow-neon transition-all duration-300 touch-target flex items-center gap-3 text-fluid-sm xs:text-fluid-base group"
                  aria-label="Facebook"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded text-white text-sm group-hover:bg-neonCyan group-hover:text-black transition-all">
                    <span>📘</span>
                  </div>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/littlelattelane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonPink hover:shadow-neon transition-all duration-300 touch-target flex items-center gap-3 text-fluid-sm xs:text-fluid-base group"
                  aria-label="Instagram"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-sm group-hover:from-neonPink group-hover:to-neonCyan transition-all">
                    <span>�</span>
                  </div>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://littlelattelane.co.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonBlue hover:shadow-neon transition-all duration-300 touch-target flex items-center gap-3 text-fluid-sm xs:text-fluid-base group"
                  aria-label="Website"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-gray-600 rounded text-white text-sm group-hover:bg-neonBlue group-hover:text-black transition-all">
                    <span>🌐</span>
                  </div>
                  <span>Website</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@littlelattelane.co.za"
                  className="hover:text-neonGreen hover:shadow-neon transition-all duration-300 touch-target flex items-center gap-3 text-fluid-sm xs:text-fluid-base group"
                  aria-label="Email"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-green-600 rounded text-white text-sm group-hover:bg-neonGreen group-hover:text-black transition-all">
                    <span>✉️</span>
                  </div>
                  <span>Email Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links - Touch-friendly */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Legal:
            </h3>
            <ul className="space-y-2 xs:space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-neonGreen hover:shadow-neon flex items-center gap-2 transition-all duration-300 touch-target text-fluid-sm xs:text-fluid-base"
                  aria-label="Terms and Conditions"
                >
                  <FileText className="h-4 w-4 xs:h-5 xs:w-5 flex-shrink-0" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-neonBlue hover:shadow-neon transition-all duration-300 touch-target text-fluid-sm xs:text-fluid-base"
                  aria-label="Privacy Policy"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section - Responsive */}
        <div className="mt-8 xs:mt-12 text-center text-fluid-xs xs:text-fluid-sm text-gray-400 border-t border-gray-700 pt-6 xs:pt-8">
          <p>
            &copy; {new Date().getFullYear()} Little Latte Lane. All rights
            reserved.
          </p>
          <p className="mt-2 xs:mt-3 flex flex-wrap justify-center gap-1 xs:gap-2">
            <Link
              href="/terms"
              className="text-neonGreen hover:text-neonPink transition-colors touch-target"
            >
              Terms & Conditions
            </Link>
            <span>|</span>
            <Link
              href="/privacy-policy"
              className="text-neonBlue hover:text-neonPink transition-colors touch-target"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
