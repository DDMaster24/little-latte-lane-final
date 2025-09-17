'use client'

import React, { useState, useCallback, useEffect } from 'react'

interface ColorValue {
  color: string
  className?: string
  [key: string]: unknown
}

interface GradientSettings {
  enabled: boolean
  colors: string[]
  direction: 'horizontal' | 'vertical' | 'diagonal-right' | 'diagonal-left' | 'radial'
}

interface SimpleColorPickerProps {
  value: ColorValue
  onChange: (value: ColorValue) => void
  _isValid?: boolean
  label?: string
  presetColors?: ColorValue[]
  supportGradient?: boolean
}

const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({
  value,
  onChange,
  _isValid = true,
  label = 'Color',
  presetColors = [],
  supportGradient = false
}) => {
  // Parse initial color - handle both string and object values
  const getInitialColor = () => {
    if (typeof value === 'string') return value
    return value?.color || '#ffffff'
  }

  const [currentColor, setCurrentColor] = useState(getInitialColor())
  const [gradientSettings, setGradientSettings] = useState<GradientSettings>({
    enabled: false,
    colors: [getInitialColor(), '#ff00ff'],
    direction: 'horizontal'
  })

  // Sync with prop changes
  useEffect(() => {
    const newColor = typeof value === 'string' ? value : (value?.color || '#ffffff')
    setCurrentColor(newColor)
  }, [value])

  // Convert 3-digit hex to 6-digit
  const normalizeHex = (hex: string): string => {
    if (hex.length === 4) {
      return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    }
    return hex
  }

  // Generate CSS gradient string
  const generateGradient = (settings: GradientSettings): string => {
    const { colors, direction } = settings
    
    const directionMap = {
      'horizontal': 'to right',
      'vertical': 'to bottom', 
      'diagonal-right': 'to bottom right',
      'diagonal-left': 'to bottom left',
      'radial': 'circle'
    }

    const gradientType = direction === 'radial' ? 'radial-gradient' : 'linear-gradient'
    const gradientDirection = directionMap[direction]
    
    return `${gradientType}(${gradientDirection}, ${colors.join(', ')})`
  }

  // Handle color updates
  const updateColor = useCallback((newColor: string, updateGradient: boolean = true) => {
    const normalizedColor = normalizeHex(newColor)
    setCurrentColor(normalizedColor)

    // Update gradient colors if in gradient mode
    if (gradientSettings.enabled && updateGradient) {
      setGradientSettings(prev => ({
        ...prev,
        colors: [normalizedColor, prev.colors[1] || '#ff00ff']
      }))
    }

    // Emit change event
    const finalValue = gradientSettings.enabled 
      ? generateGradient({ ...gradientSettings, colors: [normalizedColor, gradientSettings.colors[1] || '#ff00ff'] })
      : normalizedColor

    onChange({
      ...value,
      color: finalValue
    })
  }, [onChange, value, gradientSettings])

  // Handle native color picker change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateColor(e.target.value)
  }

  // Handle preset color selection
  const handlePresetSelect = (preset: ColorValue) => {
    updateColor(preset.color || '#ffffff')
    onChange(preset)
  }

  // Handle gradient toggle
  const handleGradientToggle = () => {
    const newEnabled = !gradientSettings.enabled
    setGradientSettings(prev => ({ ...prev, enabled: newEnabled }))

    const finalValue = newEnabled 
      ? generateGradient({ ...gradientSettings, enabled: newEnabled })
      : currentColor

    onChange({
      ...value,
      color: finalValue
    })
  }

  // Handle gradient color change
  const handleGradientColorChange = (index: number, color: string) => {
    const newColors = [...gradientSettings.colors]
    newColors[index] = color
    
    const newSettings = { ...gradientSettings, colors: newColors }
    setGradientSettings(newSettings)
    
    onChange({
      ...value,
      color: generateGradient(newSettings)
    })
  }

  // Handle gradient direction change
  const handleGradientDirectionChange = (direction: GradientSettings['direction']) => {
    const newSettings = { ...gradientSettings, direction }
    setGradientSettings(newSettings)
    
    onChange({
      ...value,
      color: generateGradient(newSettings)
    })
  }

  const displayColor = gradientSettings.enabled ? gradientSettings.colors[0] : currentColor

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {/* Simplified Color Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Single Color Picker Button */}
          <input
            type="color"
            value={displayColor}
            onChange={handleColorChange}
            className="w-12 h-12 rounded-lg border-2 border-gray-600 hover:border-gray-500 cursor-pointer transition-colors"
            title="Click to open color picker"
          />
          
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Click to open color picker</p>
            <p className="text-xs font-mono text-gray-300">
              {gradientSettings.enabled ? `${gradientSettings.colors.length} colors` : currentColor}
            </p>
          </div>

          {/* Gradient Toggle (if supported) */}
          {supportGradient && (
            <button
              type="button"
              onClick={handleGradientToggle}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                gradientSettings.enabled
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
            >
              Gradient
            </button>
          )}
        </div>
      </div>

      {/* Gradient Controls (if enabled) */}
      {supportGradient && gradientSettings.enabled && (
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Gradient Settings</h4>
          
          {/* Gradient Colors */}
          <div className="space-y-3">
            {gradientSettings.colors.map((color, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleGradientColorChange(index, e.target.value)}
                  className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
                />
                <span className="text-sm text-gray-400">Color {index + 1}</span>
                <span className="text-xs font-mono text-gray-500">{color}</span>
              </div>
            ))}
          </div>

          {/* Gradient Direction */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Direction
            </label>
            <select
              value={gradientSettings.direction}
              onChange={(e) => handleGradientDirectionChange(e.target.value as GradientSettings['direction'])}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="horizontal">Horizontal →</option>
              <option value="vertical">Vertical ↓</option>
              <option value="diagonal-right">Diagonal ↘</option>
              <option value="diagonal-left">Diagonal ↙</option>
              <option value="radial">Radial ○</option>
            </select>
          </div>
        </div>
      )}

      {/* Preset Colors */}
      {presetColors.length > 0 && (
        <div className="pt-3 border-t border-gray-700">
          <label className="block text-xs font-medium text-gray-400 mb-3">
            Preset Colors
          </label>
          <div className="grid grid-cols-8 gap-2">
            {presetColors.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  preset.color === currentColor 
                    ? 'border-white shadow-lg' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                style={{ backgroundColor: preset.color || '#ffffff' }}
                title={preset.color || '#ffffff'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleColorPicker