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
          <p>+27 123 456 789</p>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Location:
          </h3>
          <p>Roberts Estate, Gate 1, Roberts Drive</p>
          <p>Little Latte Lane</p>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-bold mb-2 bg-neon-gradient bg-clip-text text-transparent">
            Social Links:
          </h3>
          <ul className="space-y-1">
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neonPink hover:shadow-neon"
                aria-label="Facebook"
              >
                Facebook - Little Latte Lane
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neonPink hover:shadow-neon"
                aria-label="Instagram"
              >
                Instagram - Little Latte Lane
              </a>
            </li>
            <li>
              <a
                href="https://littlelattelane.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neonPink hover:shadow-neon"
                aria-label="Website"
              >
                Website - Little Latte Lane
              </a>
            </li>
            <li>
              <a
                href="mailto:info@littlelattelane.co.za"
                className="hover:text-neonPink hover:shadow-neon"
                aria-label="Email"
              >
                Email - Little Latte Lane
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
