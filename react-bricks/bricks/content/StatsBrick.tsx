import React from 'react'
import { types, Text, Repeater } from 'react-bricks/rsc'
import { TrendingUp, Users, Star, Award } from 'lucide-react'

//========================================
// StatsBrick - Business Metrics & Achievements
//========================================

interface StatsBrickProps {
  backgroundColor: string
  layout: 'horizontal' | 'grid' | 'vertical'
  animationType: 'none' | 'countup' | 'fade'
  columns: 2 | 3 | 4
  showIcons: boolean
}

const StatsBrick: types.Brick<StatsBrickProps> = ({
  backgroundColor = 'bg-darkBg/95',
  layout: _layout = 'grid', // Future layout implementation
  animationType: _animationType = 'none', // Future animation implementation
  columns = 4,
  showIcons = true,
}) => {
  // Future layout implementation
  const _layoutClasses = {
    horizontal: 'flex flex-wrap justify-center',
    grid: `grid grid-cols-2 md:grid-cols-${columns}`,
    vertical: 'flex flex-col'
  }

  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }

  return (
    <section className={`${backgroundColor} py-16 px-8 backdrop-blur-sm`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Text
            propName="title"
            placeholder="Our Success in Numbers"
            value=""
            renderBlock={(props) => (
              <h2 className="text-4xl md:text-5xl font-bold text-neonCyan mb-4 leading-tight">
                {props.children}
              </h2>
            )}
          />
          
          <Text
            propName="subtitle"
            placeholder="Trusted by gamers and food lovers across Cape Town"
            value=""
            renderBlock={(props) => (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {props.children}
              </p>
            )}
          />
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 ${columnClasses[columns]} gap-8`}>
          <Repeater
            propName="stats"
            items={[]}
            renderWrapper={(items) => <>{items}</>}
            renderItemWrapper={(item) => (
              <div className="group">
                {item}
              </div>
            )}
            itemProps={{
              showIcons,
            }}
          />
        </div>

        {/* Add Stats Note (visible in editor) */}
        <div className="text-center mt-12">
          <Text
            propName="addStatsText"
            placeholder="Click + to add statistics above"
            value=""
            renderBlock={(props) => (
              <p className="text-gray-400 italic">
                {props.children}
              </p>
            )}
          />
        </div>
      </div>
    </section>
  )
}

// Individual Stat Item Brick
interface StatItemBrickProps {
  showIcons: boolean
}

const StatItemBrick: types.Brick<StatItemBrickProps> = ({
  showIcons = true,
}) => {
  const getIcon = (iconName: string) => {
    const icons = {
      trending: TrendingUp,
      users: Users,
      star: Star,
      award: Award,
    }
    const IconComponent = icons[iconName as keyof typeof icons] || TrendingUp
    return <IconComponent size={32} className="text-neonCyan mb-4" />
  }

  return (
    <div className="text-center p-6 rounded-lg border border-neonCyan/20 bg-black/20 backdrop-blur-sm hover:border-neonPink/40 transition-all duration-300 group-hover:shadow-neon">
      {showIcons && (
        <div className="flex justify-center mb-4">
          <Text
            propName="iconName"
            placeholder="trending"
            value=""
            renderBlock={(props) => {
              const iconName = props.children?.toString() || 'trending'
              return getIcon(iconName)
            }}
          />
        </div>
      )}
      
      <Text
        propName="number"
        placeholder="1,250+"
        value=""
        renderBlock={(props) => (
          <div className="text-4xl md:text-5xl font-bold text-neonPink mb-2 group-hover:scale-110 transition-transform duration-300">
            {props.children}
          </div>
        )}
      />
      
      <Text
        propName="label"
        placeholder="Happy Customers"
        value=""
        renderBlock={(props) => (
          <h4 className="text-lg font-semibold text-gray-200 mb-2">
            {props.children}
          </h4>
        )}
      />
      
      <Text
        propName="description"
        placeholder="Satisfied diners and gamers"
        value=""
        renderBlock={(props) => (
          <p className="text-sm text-gray-400 leading-relaxed">
            {props.children}
          </p>
        )}
      />
    </div>
  )
}

StatsBrick.schema = {
  name: 'stats',
  label: 'Statistics & Metrics',
  category: 'content',
  
  sideEditProps: [
    {
      name: 'backgroundColor',
      label: 'Background',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-darkBg/95', label: 'Dark Transparent' },
          { value: 'bg-darkBg', label: 'Dark' },
          { value: 'bg-black/80', label: 'Black Transparent' },
          { value: 'bg-gradient-to-br from-neonCyan/10 to-neonPink/10', label: 'Neon Gradient' },
          { value: 'bg-transparent', label: 'Transparent' },
        ],
      },
    },
    {
      name: 'layout',
      label: 'Layout Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' },
        ],
      },
    },
    {
      name: 'columns',
      label: 'Columns',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
        ],
      },
    },
    {
      name: 'animationType',
      label: 'Animation Type',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'none', label: 'None' },
          { value: 'countup', label: 'Count Up' },
          { value: 'fade', label: 'Fade In' },
        ],
      },
    },
    {
      name: 'showIcons',
      label: 'Show Icons',
      type: types.SideEditPropType.Boolean,
    },
  ],
  
  repeaterItems: [
    {
      name: 'stats',
      itemType: 'stat-item',
      itemLabel: 'Statistic',
      min: 1,
      max: 8,
    },
  ],
}

StatItemBrick.schema = {
  name: 'stat-item',
  label: 'Stat Item',
  category: 'content',
  hideFromAddMenu: true, // Only accessible through repeater
}

export default StatsBrick
export { StatItemBrick }
