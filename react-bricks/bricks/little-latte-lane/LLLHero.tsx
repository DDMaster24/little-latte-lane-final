import { RichText, Text, types } from 'react-bricks/rsc'

//=============================
// Local Types
//=============================
type Padding = 'big' | 'small'

interface LLLHeroProps {
  padding: Padding
  title: string
  subtitle: string
  bgColor: 'dark' | 'neon'
}

//=============================
// Component to be rendered
//=============================
const LLLHero: types.Brick<LLLHeroProps> = ({
  padding,
  title,
  subtitle,
  bgColor,
}) => {
  return (
    <div 
      className={`
        ${bgColor === 'dark' ? 'bg-darkBg' : 'bg-gradient-to-br from-neonCyan via-neonPink to-purple-600'} 
        ${padding === 'big' ? 'py-20 px-8' : 'py-12 px-6'}
        min-h-[60vh] flex items-center justify-center text-center
      `}
    >
      <div className="max-w-4xl mx-auto">
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h1 className={`
              ${bgColor === 'dark' ? 'text-neonCyan' : 'text-white'} 
              text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg
              ${bgColor === 'dark' ? 'text-shadow-neon' : ''}
            `}>
              {props.children}
            </h1>
          )}
          placeholder="Enter hero title..."
        />
        <RichText
          propName="subtitle"
          value={subtitle}
          renderBlock={(props) => (
            <p className={`
              ${bgColor === 'dark' ? 'text-gray-200' : 'text-gray-100'} 
              text-lg md:text-xl leading-relaxed
            `}>
              {props.children}
            </p>
          )}
          placeholder="Enter hero subtitle..."
          allowedFeatures={[
            types.RichTextFeatures.Bold,
            types.RichTextFeatures.Italic,
          ]}
        />
      </div>
    </div>
  )
}

//=============================
// Brick Schema  
//=============================
LLLHero.schema = {
  name: 'lll-hero',
  label: 'Little Latte Lane Hero',
  category: 'Hero Sections',
  tags: ['hero', 'banner', 'title', 'neon'],
  previewImageUrl: '', // We can add this later
  getDefaultProps: () => ({
    padding: 'big',
    title: 'Welcome to Little Latte Lane',
    subtitle: 'Experience the perfect blend of coffee, food, and neon vibes in the heart of the city.',
    bgColor: 'dark',
  }),
  sideEditProps: [
    {
      name: 'padding',
      label: 'Padding',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'big', label: 'Big Padding' },
          { value: 'small', label: 'Small Padding' },
        ],
      },
    },
    {
      name: 'bgColor',
      label: 'Background Style',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Radio,
        options: [
          { value: 'dark', label: 'Dark with Neon Text' },
          { value: 'neon', label: 'Neon Gradient' },
        ],
      },
    },
  ],
}

export default LLLHero