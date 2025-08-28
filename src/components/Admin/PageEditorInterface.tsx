'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PageEditorInterface() {
  const router = useRouter();

  const handleEditHomepage = () => {
    router.push('/admin/page-editor/homepage');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Page Editor</h1>
        <p className="text-gray-400">Edit your website pages</p>
      </div>

      {/* Homepage Card */}
      <Card className="p-6 bg-darkBg/50 border-gray-700 hover:border-neonCyan/50 transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neonCyan/10 rounded-lg">
              <Home className="h-6 w-6 text-neonCyan" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Homepage</h3>
              <p className="text-gray-400 text-sm">Edit the main landing page content and sections</p>
            </div>
          </div>
          <Button
            onClick={handleEditHomepage}
            className="bg-neonCyan hover:bg-neonCyan/80 text-darkBg font-semibold"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
