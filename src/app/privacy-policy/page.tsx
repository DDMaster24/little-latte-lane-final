'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-darkBg via-gray-900 to-darkBg">
      {/* Header */}
      <div className="bg-black/50 border-b border-neon-blue/20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button
                variant="outline"
                className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-neon-blue" />
              <h1 className="text-4xl md:text-5xl font-bold bg-neon-gradient bg-clip-text text-transparent" data-editable="privacy-page-title">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-4" data-editable="privacy-company-name">Little Latte Lane</p>
            <Badge className="bg-neon-pink text-black px-4 py-2" data-editable="privacy-last-updated">
              Last Updated: August 11, 2025
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-black/40 border-neon-blue/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-neon-blue flex items-center gap-2">
              <Eye className="h-6 w-6" />
              <span data-editable="privacy-section-title">Your Privacy Matters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-8 text-gray-200">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-neon-blue/10 to-neon-pink/10 p-6 rounded-lg border border-neon-blue/20">
              <p className="text-lg leading-relaxed mb-0" data-editable="privacy-introduction">
                Little Latte Lane is committed to protecting your privacy and
                personal information in accordance with the{' '}
                <span className="text-neon-blue font-medium">
                  Protection of Personal Information Act (POPIA)
                </span>{' '}
                of South Africa. This Privacy Policy explains how we collect,
                use, and protect your personal information.
              </p>
            </div>

            {/* What We Collect */}
            <div>
              <h2 className="text-2xl font-bold text-neon-green mb-4 flex items-center gap-2">
                <Database className="h-6 w-6" />
                <span data-editable="privacy-collect-heading">Information We Collect</span>
              </h2>
              <ul className="space-y-3 text-gray-300" data-editable="privacy-collect-list">
                <li>
                  • <strong>Personal Details:</strong> Name, email address,
                  phone number
                </li>
                <li>
                  • <strong>Delivery Information:</strong> Address and delivery
                  instructions
                </li>
                <li>
                  • <strong>Order History:</strong> Previous orders and
                  preferences
                </li>
                <li>
                  • <strong>Payment Information:</strong> Processed securely via
                  Yoco (we don&apos;t store card details)
                </li>
                <li>
                  • <strong>Website Usage:</strong> Pages visited, time spent,
                  device information
                </li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div>
              <h2 className="text-2xl font-bold text-neon-pink mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                <span data-editable="privacy-use-heading">How We Use Your Information</span>
              </h2>
              <ul className="space-y-3 text-gray-300" data-editable="privacy-use-list">
                <li>• Process and fulfill your orders</li>
                <li>• Communicate about your orders and bookings</li>
                <li>• Improve our services and website experience</li>
                <li>• Send promotional offers (with your consent)</li>
                <li>• Comply with legal obligations</li>
                <li>• Prevent fraud and ensure security</li>
              </ul>
            </div>

            {/* Data Protection */}
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-6 rounded-lg border border-green-500/30">
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                Data Protection & Security
              </h2>
              <ul className="space-y-3 text-gray-300">
                <li>
                  • All data is stored securely using industry-standard
                  encryption
                </li>
                <li>
                  • Payment processing is handled by certified providers
                  (Yoco)
                </li>
                <li>
                  • Access to personal data is restricted to authorized
                  personnel only
                </li>
                <li>• Regular security audits and updates are performed</li>
                <li>
                  • We never sell your personal information to third parties
                </li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Your Rights Under POPIA
              </h2>
              <ul className="space-y-3 text-gray-300">
                <li>
                  • <strong>Access:</strong> Request to see what personal data
                  we have about you
                </li>
                <li>
                  • <strong>Correction:</strong> Request corrections to
                  inaccurate information
                </li>
                <li>
                  • <strong>Deletion:</strong> Request deletion of your personal
                  data (subject to legal requirements)
                </li>
                <li>
                  • <strong>Objection:</strong> Object to processing of your
                  data for marketing purposes
                </li>
                <li>
                  • <strong>Portability:</strong> Request a copy of your data in
                  a portable format
                </li>
              </ul>
            </div>

            {/* Contact for Privacy */}
            <div className="bg-gradient-to-r from-neon-blue/10 to-neon-green/10 p-6 rounded-lg border border-neon-blue/30">
              <h2 className="text-2xl font-bold text-neon-blue mb-4" data-editable="privacy-contact-heading">
                Privacy Concerns
              </h2>
              <p className="text-gray-300 mb-4" data-editable="privacy-contact-description">
                If you have any questions about this Privacy Policy or want to
                exercise your rights, contact us:
              </p>
              <ul className="space-y-2 text-gray-300" data-editable="privacy-contact-details">
                <li>
                  <strong>Email:</strong> privacy@littlelattelane.co.za
                </li>
                <li>
                  <strong>Phone:</strong> +27 11 123 4567
                </li>
                <li>
                  <strong>Address:</strong> Roberts Estate, Roodepoort, South
                  Africa
                </li>
              </ul>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-2xl font-bold text-neon-pink mb-4">
                Policy Updates
              </h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. Any changes
                will be posted on this page with an updated &quot;Last
                Updated&quot; date. Continued use of our services after changes
                constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-8 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                This Privacy Policy is compliant with the Protection of Personal
                Information Act (POPIA) of South Africa.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
