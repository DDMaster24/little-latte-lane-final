'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Palette, Type, Layout } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

interface WelcomingContent {
  mainHeading: string;
  heroSubheading: string;
  nowOpenBadge: string;
  serviceOptionsBadge: string;
  ctaHeading: string;
  ctaDescription: string;
  qualityFeatureText: string;
  locationFeatureText: string;
  parkingFeatureText: string;
}

interface StylingOptions {
  mainHeadingColor: string;
  mainHeadingSize: number;
  subtitleColor: string;
  subtitleSize: number;
  backgroundColor: string;
}

export default function ContentEditor() {
  const { profile } = useAuth();
  const [content, setContent] = useState<WelcomingContent>({
    mainHeading: 'Welcome to Little Latte Lane!',
    heroSubheading: 'Café & Deli - Where Great Food Meets Amazing Experiences',
    nowOpenBadge: 'Now Open',
    serviceOptionsBadge: 'Dine In • Takeaway • Delivery',
    ctaHeading: 'Ready to Experience Little Latte Lane?',
    ctaDescription: 'Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere.',
    qualityFeatureText: 'Exceptional Quality',
    locationFeatureText: 'Prime Location',
    parkingFeatureText: 'Easy Parking'
  });

  const [styling, setStyling] = useState<StylingOptions>({
    mainHeadingColor: '#00ffff',
    mainHeadingSize: 48,
    subtitleColor: '#d1d5db',
    subtitleSize: 24,
    backgroundColor: '#1f2937'
  });

  const [loading, setLoading] = useState(false);

  // Predefined color options
  const colorOptions = [
    { name: 'Neon Cyan', value: '#00ffff' },
    { name: 'Neon Pink', value: '#ff1493' },
    { name: 'Neon Green', value: '#00ff00' },
    { name: 'Neon Purple', value: '#8a2be2' },
    { name: 'Orange', value: '#ff6600' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#d1d5db' },
  ];

  const gradientOptions = [
    { name: 'Cyan to Pink', value: 'linear-gradient(45deg, #00ffff, #ff1493)' },
    { name: 'Pink to Purple', value: 'linear-gradient(45deg, #ff1493, #8a2be2)' },
    { name: 'Green to Yellow', value: 'linear-gradient(45deg, #00ff00, #ffff00)' },
    { name: 'Purple to Cyan', value: 'linear-gradient(45deg, #8a2be2, #00ffff)' },
  ];

  // Load existing content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/component-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          componentId: 'HomepageWelcoming',
          action: 'get'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
        }
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const saveContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/component-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          componentId: 'HomepageWelcoming',
          action: 'update',
          content: content,
          styling: styling
        })
      });

      if (response.ok) {
        toast.success('Content saved successfully!');
        
        // Notify live homepage of changes
        window.postMessage({
          type: 'CONTENT_UPDATED',
          content: content,
          styling: styling
        }, '*');
        
      } else {
        toast.error('Failed to save content');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const previewChanges = () => {
    // Open homepage in new tab for live preview
    window.open('/', '_blank');
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="bg-gray-900/50 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4">
            Quick Content Editor
          </h1>
          <p className="text-gray-400 mb-6">
            Simple, fast editing for your homepage content
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={saveContent}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button 
              onClick={previewChanges}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Layout className="w-4 h-4 mr-2" />
              Preview Live
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="content" className="data-[state=active]:bg-cyan-600">
              <Type className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="styling" className="data-[state=active]:bg-pink-600">
              <Palette className="w-4 h-4 mr-2" />
              Styling
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-cyan-400">Welcome Section Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mainHeading" className="text-white">Main Heading</Label>
                  <Input
                    id="mainHeading"
                    value={content.mainHeading}
                    onChange={(e) => setContent({...content, mainHeading: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="heroSubheading" className="text-white">Subtitle</Label>
                  <Textarea
                    id="heroSubheading"
                    value={content.heroSubheading}
                    onChange={(e) => setContent({...content, heroSubheading: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nowOpenBadge" className="text-white">Status Badge</Label>
                    <Input
                      id="nowOpenBadge"
                      value={content.nowOpenBadge}
                      onChange={(e) => setContent({...content, nowOpenBadge: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="serviceOptionsBadge" className="text-white">Service Options</Label>
                    <Input
                      id="serviceOptionsBadge"
                      value={content.serviceOptionsBadge}
                      onChange={(e) => setContent({...content, serviceOptionsBadge: e.target.value})}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ctaHeading" className="text-white">Call-to-Action Heading</Label>
                  <Input
                    id="ctaHeading"
                    value={content.ctaHeading}
                    onChange={(e) => setContent({...content, ctaHeading: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ctaDescription" className="text-white">Call-to-Action Description</Label>
                  <Textarea
                    id="ctaDescription"
                    value={content.ctaDescription}
                    onChange={(e) => setContent({...content, ctaDescription: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-pink-400">Visual Styling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Heading Styling */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Main Heading</h3>
                  
                  <div>
                    <Label className="text-white">Colors</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <Button
                          key={color.name}
                          onClick={() => setStyling({...styling, mainHeadingColor: color.value})}
                          className="h-12 text-xs"
                          style={{ backgroundColor: color.value, color: color.value === '#ffffff' ? '#000' : '#fff' }}
                        >
                          {color.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Gradients</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {gradientOptions.map((gradient) => (
                        <Button
                          key={gradient.name}
                          onClick={() => setStyling({...styling, mainHeadingColor: gradient.value})}
                          className="h-12 text-xs text-white"
                          style={{ background: gradient.value }}
                        >
                          {gradient.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="mainHeadingSize" className="text-white">
                      Font Size: {styling.mainHeadingSize}px
                    </Label>
                    <input
                      id="mainHeadingSize"
                      type="range"
                      min="24"
                      max="96"
                      value={styling.mainHeadingSize}
                      onChange={(e) => setStyling({...styling, mainHeadingSize: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                  </div>
                </div>

                {/* Subtitle Styling */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Subtitle</h3>
                  
                  <div>
                    <Label className="text-white">Colors</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {colorOptions.map((color) => (
                        <Button
                          key={color.name}
                          onClick={() => setStyling({...styling, subtitleColor: color.value})}
                          className="h-12 text-xs"
                          style={{ backgroundColor: color.value, color: color.value === '#ffffff' ? '#000' : '#fff' }}
                        >
                          {color.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subtitleSize" className="text-white">
                      Font Size: {styling.subtitleSize}px
                    </Label>
                    <input
                      id="subtitleSize"
                      type="range"
                      min="16"
                      max="48"
                      value={styling.subtitleSize}
                      onChange={(e) => setStyling({...styling, subtitleSize: parseInt(e.target.value)})}
                      className="w-full mt-2"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="border border-gray-600 rounded-lg p-6 bg-gray-800">
                  <h4 className="text-white mb-4">Live Preview</h4>
                  <div 
                    className="text-center p-6 rounded"
                    style={{ backgroundColor: styling.backgroundColor }}
                  >
                    <h1 
                      style={{ 
                        color: styling.mainHeadingColor.includes('gradient') ? 'transparent' : styling.mainHeadingColor,
                        background: styling.mainHeadingColor.includes('gradient') ? styling.mainHeadingColor : 'none',
                        WebkitBackgroundClip: styling.mainHeadingColor.includes('gradient') ? 'text' : 'initial',
                        fontSize: `${styling.mainHeadingSize}px`,
                        fontWeight: 'bold',
                        marginBottom: '16px'
                      }}
                    >
                      {content.mainHeading}
                    </h1>
                    <p 
                      style={{ 
                        color: styling.subtitleColor,
                        fontSize: `${styling.subtitleSize}px`
                      }}
                    >
                      {content.heroSubheading}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
