'use client'

import React, { useState, useCallback, useEffect } from 'react'

// Color picker utility functions
const _hsvaToHsla = (h: number, s: number, v: number, a: number) => {
  const l = v * (2 - s) / 2
  const sl = l !== 0 && l !== 1 ? (v - l) / Math.min(l, 1 - l) : 0
  return { h, s: sl, l, a }
}

const hslaToRgba = (h: number, s: number, l: number, a: number) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a
  }
}

const rgbaToHex = (r: number, g: number, b: number, a?: number) => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  return a !== undefined && a < 1 ? hex + toHex(a * 255) : hex
}

const hexToRgba = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0, a: 1 }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: result[4] ? parseInt(result[4], 16) / 255 : 1
  }
}

const rgbaToHsva = (r: number, g: number, b: number, a: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6
    else if (max === g) h = (b - r) / diff + 2
    else h = (r - g) / diff + 4
  }
  h = Math.round(h * 60)
  if (h < 0) h += 360

  const s = max === 0 ? 0 : diff / max
  const v = max

  return { h, s, v, a }
}

interface ColorValue {
  color: string
  className?: string
  [key: string]: unknown
}

interface AdvancedColorPickerProps {
  value: ColorValue
  onChange: (value: ColorValue) => void
  _isValid?: boolean
  label?: string
  _includeTransparency?: boolean
  presetColors?: ColorValue[]
}

const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  value,
  onChange,
  _isValid = true,
  label = 'Color',
  _includeTransparency = false, // Simplified - no transparency by default
  presetColors = []
}) => {
  // Parse initial color
  const initialRgba = hexToRgba(value?.color || '#ffffff')
  const initialHsva = rgbaToHsva(initialRgba.r, initialRgba.g, initialRgba.b, initialRgba.a)

  // Start with full saturation for cleaner colors
  const [hsva, setHsva] = useState({ ...initialHsva, s: 1 })
  const [showPicker, setShowPicker] = useState(false)
  const [hexInput, setHexInput] = useState(value?.color || '#ffffff')

  // Update color when value prop changes
  useEffect(() => {
    const rgba = hexToRgba(value?.color || '#ffffff')
    const newHsva = rgbaToHsva(rgba.r, rgba.g, rgba.b, rgba.a)
    setHsva({ ...newHsva, s: 1 }) // Keep saturation at 100%
    setHexInput(value?.color || '#ffffff')
  }, [value?.color])

  const updateColor = useCallback((newHsva: typeof hsva) => {
    // Force saturation to 100% for vivid colors
    const adjustedHsva = { ...newHsva, s: 1, a: 1 }
    const rgba = hslaToRgba(adjustedHsva.h, adjustedHsva.s, adjustedHsva.v, adjustedHsva.a)
    const hex = rgbaToHex(rgba.r, rgba.g, rgba.b)
    
    onChange({
      ...value,
      color: hex
    })
  }, [onChange, value])

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value)
    const newHsva = { ...hsva, h }
    setHsva(newHsva)
    updateColor(newHsva)
  }

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value) / 100
    const newHsva = { ...hsva, v }
    setHsva(newHsva)
    updateColor(newHsva)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setHexInput(newValue)
    
    // Validate and update color if it's a valid hex
    if (/^#([A-Fa-f0-9]{6})$/.test(newValue)) {
      const rgba = hexToRgba(newValue)
      const newHsva = rgbaToHsva(rgba.r, rgba.g, rgba.b, rgba.a)
      setHsva({ ...newHsva, s: 1 }) // Keep saturation at 100%
      onChange({
        ...value,
        color: newValue
      })
    }
  }

  const currentRgba = hslaToRgba(hsva.h, hsva.s, hsva.v, 1)
  const currentHex = rgbaToHex(currentRgba.r, currentRgba.g, currentRgba.b)

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {/* Clean Layout - Color Button + Label */}
      <div className="space-y-3">
        {/* Color Selection Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="relative w-12 h-12 rounded-lg border-2 border-gray-600 hover:border-gray-500 transition-colors overflow-hidden shadow-lg"
            style={{ backgroundColor: currentHex }}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: currentHex }}
            ></div>
          </button>
          
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Select Your Color</p>
            <p className="text-xs font-mono text-gray-300">{currentHex}</p>
          </div>
        </div>

        {/* Hex Input Field */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Hex Color Code
          </label>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
            placeholder="#ffffff"
          />
        </div>

        {/* RGB Display */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            RGB Values
          </label>
          <div className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-md">
            <span className="text-sm font-mono text-gray-300">
              rgb({currentRgba.r}, {currentRgba.g}, {currentRgba.b})
            </span>
          </div>
        </div>
      </div>

      {/* Simplified Color Picker Panel */}
      {showPicker && (
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-4">
          {/* Hue Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Color Hue: {Math.round(hsva.h)}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={hsva.h}
              onChange={handleHueChange}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            />
          </div>

          {/* Brightness Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Brightness: {Math.round(hsva.v * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsva.v * 100}
              onChange={handleBrightnessChange}
              className="w-full h-4 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000000, hsl(${hsva.h}, 100%, 50%))`
              }}
            />
          </div>

          {/* Preset Colors */}
          {presetColors.length > 0 && (
            <div className="pt-3 border-t border-gray-700">
              <label className="block text-xs font-medium text-gray-400 mb-3">
                Preset Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const rgba = hexToRgba(preset?.color || '#ffffff')
                      const newHsva = rgbaToHsva(rgba.r, rgba.g, rgba.b, rgba.a)
                      setHsva({ ...newHsva, s: 1 }) // Keep saturation at 100%
                      onChange(preset)
                      setHexInput(preset?.color || '#ffffff')
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-600 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: preset?.color || '#ffffff' }}
                    title={preset?.color || '#ffffff'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdvancedColorPicker
