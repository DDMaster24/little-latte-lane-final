/**
 * Android App Links Verification
 * This file allows Android to verify that your app can handle links from your domain
 * 
 * Required for deep linking to work properly
 * Accessed at: https://www.littlelattelane.co.za/.well-known/assetlinks.json
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'co.za.littlelattelane.app',
        sha256_cert_fingerprints: [
          // Debug keystore fingerprint (for testing in debug builds)
          '27:0A:E7:A1:9B:BA:03:9A:BD:FE:79:B7:D6:E9:4A:62:81:6A:CB:A1:EA:B1:E1:B2:D7:FA:DD:1A:91:82:C2:7B',
          // Release keystore fingerprint (for production builds)
          '5F:F6:05:68:C3:D3:E0:07:9E:CA:36:4E:C4:C6:7B:F8:8E:C1:4E:D0:77:07:56:C8:E5:3F:04:FB:A6:DB:B6:AC',
        ],
      },
    },
  ];

  return NextResponse.json(assetlinks, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
