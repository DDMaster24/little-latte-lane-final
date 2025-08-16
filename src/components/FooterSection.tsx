'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-darkBg py-8 px-6 text-neonText border-t-4 border-neonCyan shadow-neon">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Contact Number:
          </h3>
          <p>+27 (0)12 345 6789</p>
          <p className="text-sm text-gray-400 mt-1">Operating Hours:</p>
          <p className="text-sm">Mon-Sun: 8:00 AM - 10:00 PM</p>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Location:
          </h3>
          <p>Roberts Estate, Gate 1</p>
          <p>Roberts Drive, Little Latte Lane</p>
          <p className="text-sm text-gray-400 mt-1">Johannesburg, South Africa</p>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Connect With Us:
          </h3>
          <ul className="space-y-1">
            <li>
              <a
                href="https://facebook.com/littlelattelane"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neonPink hover:shadow-neon transition-all duration-300"
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
                className="hover:text-neonPink hover:shadow-neon transition-all duration-300"
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
                className="hover:text-neonPink hover:shadow-neon transition-all duration-300"
                aria-label="Website"
              >
                🌐 Website
              </a>
            </li>
            <li>
              <a
                href="mailto:info@littlelattelane.co.za"
                className="hover:text-neonPink hover:shadow-neon transition-all duration-300"
                aria-label="Email"
              >
                ✉️ Email Us
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Legal:
          </h3>
          <ul className="space-y-1">
            <li>
              <Link
                href="/terms"
                className="hover:text-neonGreen hover:shadow-neon flex items-center gap-2 transition-all duration-300"
                aria-label="Terms and Conditions"
              >
                <FileText className="h-4 w-4" />
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-neonBlue hover:shadow-neon transition-all duration-300"
                aria-label="Privacy Policy"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400 border-t border-gray-700 pt-6">
        <p>
          &copy; {new Date().getFullYear()} Little Latte Lane. All rights
          reserved.
        </p>
        <p className="mt-2">
          <Link
            href="/terms"
            className="text-neonGreen hover:text-neonPink transition-colors"
          >
            Terms & Conditions
          </Link>
          {' | '}
          <Link
            href="/privacy-policy"
            className="text-neonBlue hover:text-neonPink transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  );
}
