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
            <p className="text-fluid-xs text-gray-400 mt-2">Operating Hours:</p>
            <p className="text-fluid-xs xs:text-fluid-sm">Mon-Sun: 8:00 AM - 10:00 PM</p>
          </div>

          {/* Location - Responsive Layout */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Location:
            </h3>
            <p className="text-fluid-sm xs:text-fluid-base">Roberts Estate, Gate 1</p>
            <p className="text-fluid-sm xs:text-fluid-base">Roberts Drive, Little Latte Lane</p>
            <p className="text-fluid-xs text-gray-400 mt-2">Johannesburg, South Africa</p>
          </div>

          {/* Social Links - Touch-friendly */}
          <div>
            <h3 className="text-fluid-base xs:text-fluid-lg font-bold mb-3 xs:mb-4 bg-neon-gradient bg-clip-text text-transparent">
              Connect With Us:
            </h3>
            <ul className="space-y-2 xs:space-y-3">
              <li>
                <a
                  href="https://facebook.com/littlelattelane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonPink hover:shadow-neon transition-all duration-300 touch-target flex items-center text-fluid-sm xs:text-fluid-base"
                  aria-label="Facebook"
                >
                  📘 Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/littlelattelane"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonPink hover:shadow-neon transition-all duration-300 touch-target flex items-center text-fluid-sm xs:text-fluid-base"
                  aria-label="Instagram"
                >
                  📸 Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://littlelattelane.co.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neonPink hover:shadow-neon transition-all duration-300 touch-target flex items-center text-fluid-sm xs:text-fluid-base"
                  aria-label="Website"
                >
                  🌐 Website
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@littlelattelane.co.za"
                  className="hover:text-neonPink hover:shadow-neon transition-all duration-300 touch-target flex items-center text-fluid-sm xs:text-fluid-base"
                  aria-label="Email"
                >
                  ✉️ Email Us
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
