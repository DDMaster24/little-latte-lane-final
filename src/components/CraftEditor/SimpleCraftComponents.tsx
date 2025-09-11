'use client';

import React, { useCallback } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Upload
} from 'lucide-react';

// Simple Text Component
export const CraftText = ({ 
  text = 'Edit this text',
  fontSize = 16,
  color = '#ffffff',
  textAlign = 'left'
}: {
  text?: string;
  fontSize?: number;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  
  const handleTextChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    setProp((props: any) => props.text = e.currentTarget.textContent || '');
  }, [setProp]);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        fontSize: `${fontSize}px`,
        color,
        textAlign,
        padding: '8px',
        border: '1px dashed rgba(255,255,255,0.3)',
        minHeight: '40px',
        cursor: 'pointer'
      }}
    >
      <ContentEditable
        html={text}
        onChange={handleTextChange}
        tagName="div"
        style={{ outline: 'none' }}
      />
    </div>
  );
};

// Text Settings Panel
const CraftTextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bold className="w-4 h-4" />
          Text Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white">Font Size: {props.fontSize}px</Label>
          <Slider
            value={[props.fontSize]}
            onValueChange={(value) => setProp((props: any) => props.fontSize = value[0])}
            min={10}
            max={72}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label className="text-white">Color</Label>
          <Input
            type="color"
            value={props.color}
            onChange={(e) => setProp((props: any) => props.color = e.target.value)}
            className="mt-2 h-10"
          />
        </div>

        <div>
          <Label className="text-white">Text Alignment</Label>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant={props.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => setProp((props: any) => props.textAlign = 'left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={props.textAlign === 'center' ? 'default' : 'outline'}
              onClick={() => setProp((props: any) => props.textAlign = 'center')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={props.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => setProp((props: any) => props.textAlign = 'right')}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Image Component
export const CraftImage = ({ 
  src = 'https://via.placeholder.com/300x200',
  alt = 'Image',
  width = 300,
  height = 200
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        border: '1px dashed rgba(255,255,255,0.3)',
        padding: '4px',
        display: 'inline-block'
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};

// Image Settings Panel
const CraftImageSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Image Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white">Image URL</Label>
          <Input
            value={props.src}
            onChange={(e) => setProp((props: any) => props.src = e.target.value)}
            placeholder="Enter image URL"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label className="text-white">Width: {props.width}px</Label>
          <Slider
            value={[props.width]}
            onValueChange={(value) => setProp((props: any) => props.width = value[0])}
            min={100}
            max={800}
            step={10}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-white">Height: {props.height}px</Label>
          <Slider
            value={[props.height]}
            onValueChange={(value) => setProp((props: any) => props.height = value[0])}
            min={100}
            max={600}
            step={10}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Container Component
export const CraftContainer = ({ 
  backgroundColor = 'rgba(0,0,0,0.2)',
  padding = 20,
  children
}: {
  backgroundColor?: string;
  padding?: number;
  children?: React.ReactNode;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        minHeight: '100px',
        border: '1px dashed rgba(255,255,255,0.3)',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

// Container Settings Panel
const CraftContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Container Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white">Background Color</Label>
          <Input
            type="color"
            value={props.backgroundColor}
            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
            className="mt-2 h-10"
          />
        </div>
        
        <div>
          <Label className="text-white">Padding: {props.padding}px</Label>
          <Slider
            value={[props.padding]}
            onValueChange={(value) => setProp((props: any) => props.padding = value[0])}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Button Component
export const CraftButton = ({ 
  text = 'Click me',
  backgroundColor = '#06b6d4',
  color = '#ffffff',
  fontSize = 16
}: {
  text?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
}) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();

  return (
    <button
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      style={{
        backgroundColor,
        color,
        fontSize: `${fontSize}px`,
        padding: '12px 24px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        outline: '1px dashed rgba(255,255,255,0.3)'
      }}
    >
      <ContentEditable
        html={text}
        onChange={(e) => setProp((props: any) => props.text = e.currentTarget.textContent || '')}
        tagName="span"
        style={{ outline: 'none' }}
      />
    </button>
  );
};

// Button Settings Panel
const CraftButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Button Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white">Background Color</Label>
          <Input
            type="color"
            value={props.backgroundColor}
            onChange={(e) => setProp((props: any) => props.backgroundColor = e.target.value)}
            className="mt-2 h-10"
          />
        </div>
        
        <div>
          <Label className="text-white">Text Color</Label>
          <Input
            type="color"
            value={props.color}
            onChange={(e) => setProp((props: any) => props.color = e.target.value)}
            className="mt-2 h-10"
          />
        </div>

        <div>
          <Label className="text-white">Font Size: {props.fontSize}px</Label>
          <Slider
            value={[props.fontSize]}
            onValueChange={(value) => setProp((props: any) => props.fontSize = value[0])}
            min={10}
            max={32}
            step={1}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Assign settings to components
CraftText.craft = {
  props: {
    text: 'Edit this text',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'left'
  },
  related: {
    settings: CraftTextSettings
  }
};

CraftImage.craft = {
  props: {
    src: 'https://via.placeholder.com/300x200',
    alt: 'Image',
    width: 300,
    height: 200
  },
  related: {
    settings: CraftImageSettings
  }
};

CraftContainer.craft = {
  props: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 20
  },
  related: {
    settings: CraftContainerSettings
  }
};

CraftButton.craft = {
  props: {
    text: 'Click me',
    backgroundColor: '#06b6d4',
    color: '#ffffff',
    fontSize: 16
  },
  related: {
    settings: CraftButtonSettings
  }
};
