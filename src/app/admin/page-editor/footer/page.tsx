'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import UniversalPageEditor from '@/components/Admin/UniversalPageEditor';
import StyleLoader from '@/components/StyleLoader';

// Create a demo footer component for editing
function EditableFooter() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 
              data-editable="footer-company-title"
              className="text-lg font-semibold text-neonCyan"
            >
              Little Latte Lane
            </h3>
            <p 
              data-editable="footer-company-description"
              className="text-gray-300 text-sm leading-relaxed"
            >
              Your cozy coffee destination. Serving the finest coffee, delicious food, and creating memorable experiences since day one.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                data-editable="footer-social-facebook"
                className="text-gray-400 hover:text-neonPink transition-colors duration-200"
              >
                📘 Facebook
              </a>
              <a
                href="#"
                data-editable="footer-social-instagram"
                className="text-gray-400 hover:text-neonPink transition-colors duration-200"
              >
                📷 Instagram
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 
              data-editable="footer-quicklinks-title"
              className="text-lg font-semibold text-neonCyan"
            >
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/menu"
                data-editable="footer-link-menu"
                className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
              >
                Our Menu
              </Link>
              <Link
                href="/bookings"
                data-editable="footer-link-bookings"
                className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
              >
                Reservations
              </Link>
              <Link
                href="/account"
                data-editable="footer-link-account"
                className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
              >
                My Account
              </Link>
              <Link
                href="/staff"
                data-editable="footer-link-staff"
                className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
              >
                Staff Portal
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 
              data-editable="footer-contact-title"
              className="text-lg font-semibold text-neonCyan"
            >
              Contact Us
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p data-editable="footer-address">
                📍 123 Coffee Street, Johannesburg
              </p>
              <p data-editable="footer-phone">
                📞 +27 11 123 4567
              </p>
              <p data-editable="footer-email">
                ✉️ hello@littlelattelane.co.za
              </p>
              <p data-editable="footer-hours">
                🕐 Mon-Sun: 7AM - 10PM
              </p>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 
              data-editable="footer-newsletter-title"
              className="text-lg font-semibold text-neonCyan"
            >
              Stay Updated
            </h3>
            <p 
              data-editable="footer-newsletter-description"
              className="text-gray-300 text-sm"
            >
              Subscribe to our newsletter for special offers and new menu items.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-neonCyan transition-colors duration-200"
              />
              <button
                data-editable="footer-newsletter-button"
                className="w-full bg-neonPink hover:bg-neonPink/80 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p 
              data-editable="footer-copyright"
              className="text-gray-400 text-sm"
            >
              © 2024 Little Latte Lane. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy-policy"
                data-editable="footer-privacy-link"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                data-editable="footer-terms-link"
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Styling Instructions */}
      <div className="bg-gray-800/50 border-t border-gray-700/30 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 
              data-editable="footer-editor-title"
              className="text-lg font-semibold text-neonPink mb-2"
            >
              🦶 Footer Editor Preview
            </h2>
            <p 
              data-editable="footer-editor-description"
              className="text-gray-300 text-sm"
            >
              Edit contact information, links, social media, and styling. Changes will apply site-wide to all pages.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function FooterEditorPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/callback');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darkBg">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Load existing styles for footer */}
      <StyleLoader pageScope="footer" />
      
      <UniversalPageEditor
        pageScope="footer"
        pageName="Footer"
        enabledTools={['select', 'text', 'color']}
      >
        <div className="bg-darkBg min-h-screen">
          {/* Preview Information */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Footer Editor Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-neonCyan mb-2">Editable Elements:</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Company information and description</li>
                    <li>• Contact details and hours</li>
                    <li>• Quick navigation links</li>
                    <li>• Social media links and icons</li>
                    <li>• Newsletter signup section</li>
                    <li>• Copyright and legal links</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-neonPink mb-2">Global Impact:</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Changes apply to all website pages</li>
                    <li>• Contact info updates everywhere</li>
                    <li>• Consistent brand messaging</li>
                    <li>• Unified social media presence</li>
                    <li>• Site-wide legal compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <EditableFooter />
        </div>
      </UniversalPageEditor>
    </>
  );
}
