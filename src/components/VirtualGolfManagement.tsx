'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
// Update the import path if the Switch component exists elsewhere, for example:
import { Switch } from '@/components/ui/switch';
// Or, if the correct path is different, adjust accordingly:
// import { Switch } from '../ui/Switch';
// If the file does not exist, create 'Switch.tsx' in the specified directory.
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VirtualGolfSettings {
  enabled: boolean;
  comingSoonMessage: string;
}

export default function VirtualGolfManagement() {
  const [settings, setSettings] = useState<VirtualGolfSettings>({
    enabled: false,
    comingSoonMessage: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    try {
      // TODO: Implement settings storage solution
      // Virtual golf settings currently disabled - no settings table in database
      const defaultSettings = {
        enabled: false,
        comingSoonMessage:
          '🏌️‍♂️ Virtual Golf Coming Soon! Stay tuned for an exciting new experience at Little Latte Lane.',
      };
      console.log('🔧 Using default settings:', defaultSettings);
      setSettings(defaultSettings);
    } catch (err) {
      console.error('💥 Failed to fetch settings:', err);
      // Use default settings on any error
      const defaultSettings = {
        enabled: false,
        comingSoonMessage:
          '🏌️‍♂️ Virtual Golf Coming Soon! Stay tuned for an exciting new experience at Little Latte Lane.',
      };
      console.log('🔧 Using fallback settings:', defaultSettings);
      setSettings(defaultSettings);
      toast.error('Unable to load settings. Using default values.');
    }
    console.log('✅ fetchSettings completed, setting loading to false');
    setIsLoading(false);
  }

  async function saveSettings() {
    // TODO: Implement settings storage solution
    // Currently disabled - no settings table in database
    toast.info('Settings storage not implemented yet');
    return;
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Virtual Golf Management
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            settings.enabled
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {settings.enabled ? '🟢 LIVE' : '🔴 OFFLINE'}
        </div>
      </div>

      <div className="space-y-6">
        {/* Activation Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-white text-lg font-medium">
              Virtual Golf Bookings
            </Label>
            <p className="text-gray-400 text-sm">
              {settings.enabled
                ? 'Users can currently make virtual golf bookings'
                : 'Virtual golf bookings are disabled - users see "Coming Soon" banner'}
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked: boolean) =>
              setSettings((prev) => ({ ...prev, enabled: checked }))
            }
            className="data-[state=checked]:bg-neonCyan"
          />
        </div>

        {/* Coming Soon Message */}
        <div className="space-y-3">
          <Label className="text-white text-lg font-medium">
            Coming Soon Message
          </Label>
          <p className="text-gray-400 text-sm">
            This message will be displayed to users when virtual golf is
            disabled
          </p>
          <Textarea
            value={settings.comingSoonMessage}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                comingSoonMessage: e.target.value,
              }))
            }
            placeholder="Enter the message users will see when virtual golf is coming soon..."
            className="bg-gray-700 border-gray-600 text-white min-h-[120px] resize-none"
            rows={5}
          />
        </div>

        {/* Preview */}
        {!settings.enabled && settings.comingSoonMessage && (
          <div className="space-y-3">
            <Label className="text-white text-lg font-medium">Preview</Label>
            <div className="bg-gray-900/50 p-6 rounded-lg border border-neonCyan/30">
              <div className="text-center">
                <div className="text-4xl mb-4">🏌️‍♂️</div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-neonCyan via-neonPink to-neonBlue bg-clip-text text-transparent">
                  Virtual Golf Coming Soon!
                </h3>
                <div className="text-gray-300 whitespace-pre-line">
                  {settings.comingSoonMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            className="bg-neonCyan hover:bg-neonCyan/80 text-black flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            onClick={fetchSettings}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Reset
          </Button>
        </div>

        {/* Help Text */}
        <div className="bg-neonBlue/10 border border-neonBlue/30 rounded-lg p-4">
          <h4 className="text-neonBlue font-medium mb-2">💡 How it works:</h4>
          <ul className="text-sm text-neonBlue/80 space-y-1">
            <li>
              • When <strong>OFF</strong>: Users see a &ldquo;Coming Soon&rdquo;
              banner covering the entire booking page
            </li>
            <li>
              • When <strong>ON</strong>: Users can access the full booking
              system and make reservations
            </li>
            <li>• Changes take effect immediately across your website</li>
            <li>
              • You can customize the coming soon message to match your launch
              timeline
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
