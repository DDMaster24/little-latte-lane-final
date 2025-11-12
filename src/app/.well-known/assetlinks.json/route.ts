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
          // Debug keystore fingerprint (for local testing in Android Studio)
          '27:0A:E7:A1:9B:BA:03:9A:BD:FE:79:B7:D6:E9:4A:62:81:6A:CB:A1:EA:B1:E1:B2:D7:FA:DD:1A:91:82:C2:7B',
          // Upload key certificate (your local keystore - used before Play Console)
          '5F:F6:05:68:C3:D3:E0:07:9E:CA:36:4E:C4:C6:7B:F8:8E:C1:4E:D0:77:07:56:C8:E5:3F:04:FB:A6:DB:B6:AC',
          // App signing key certificate (Google Play Console - PRODUCTION)
          '45:96:AA:AA:3B:12:6F:41:BA:79:8E:70:8F:A1:B5:DB:15:56:32:8A:60:98:BB:ED:72:F8:59:0C:78:71:1D:6C',
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
