import React from 'react'
import { Text, RichText, types } from 'react-bricks/frontend'
import { Badge } from '@/components/ui/badge'
import DynamicCarousel from '@/components/DynamicCarousel'
import { useAuth } from '@/components/AuthProvider'

//========================================
// Component
//========================================
const LLLWelcomingSection: types.Brick = () => {
  const { user } = useAuth()
  
  // Get the user's first name for personalized greeting
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend'

  return (
    <section 
      className="relative w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: 'url("/images/food-drinks-neon-wp.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
      
      {/* Content container */}
      <div className="relative z-10 text-center px-4 xs:px-6 sm:px-8 max-w-5xl mx-auto">
        {/* Main heading with gradient */}
        <Text
          propName="mainHeading"
          placeholder="Welcome to Little Latte Lane"
          renderBlock={(props) => (
            <h1 
              className="text-fluid-3xl xs:text-fluid-4xl sm:text-fluid-5xl md:text-fluid-6xl font-bold mb-4 xs:mb-6 leading-tight bg-neon-gradient bg-clip-text text-transparent animate-fade-in"
              {...props.attributes}
            >
              {props.children}
            </h1>
          )}
        />

        {/* Personalized greeting for authenticated users */}
        {user && (
          <div className="mb-4 xs:mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Text
              propName="personalGreeting"
              placeholder={`Welcome back, ${firstName}!`}
              renderBlock={(props) => (
                <p 
                  className="text-fluid-lg xs:text-fluid-xl text-neonCyan font-medium"
                  {...props.attributes}
                >
                  {props.children}
                </p>
              )}
            />
          </div>
        )}

        {/* Subtitle/description */}
        <RichText
          propName="subtitle"
          placeholder="Premium coffee, fresh food & virtual golf in the heart of your neighborhood"
          renderBlock={(props) => (
            <p 
              className="text-fluid-base xs:text-fluid-lg mb-6 xs:mb-8 text-neonText max-w-3xl mx-auto leading-relaxed animate-fade-in"
              style={{ animationDelay: '0.4s' }}
              {...props.attributes}
            >
              {props.children}
            </p>
          )}
        />

        {/* Badges row */}
        <div className="flex flex-wrap justify-center gap-3 xs:gap-4 mb-6 xs:mb-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Text
            propName="badge1"
            placeholder="Fresh Coffee"
            renderBlock={(props) => (
              <Badge 
                className="text-fluid-xs xs:text-fluid-sm px-3 xs:px-4 py-1 xs:py-2 bg-neonCyan/20 text-neonCyan border-neonCyan/30"
                {...props.attributes}
              >
                ☕ {props.children}
              </Badge>
            )}
          />
          <Text
            propName="badge2"
            placeholder="Virtual Golf"
            renderBlock={(props) => (
              <Badge 
                className="text-fluid-xs xs:text-fluid-sm px-3 xs:px-4 py-1 xs:py-2 bg-neonPink/20 text-neonPink border-neonPink/30"
                {...props.attributes}
              >
                ⛳ {props.children}
              </Badge>
            )}
          />
          <Text
            propName="badge3"
            placeholder="Fresh Food"
            renderBlock={(props) => (
              <Badge 
                className="text-fluid-xs xs:text-fluid-sm px-3 xs:px-4 py-1 xs:py-2 bg-neonGreen/20 text-neonGreen border-neonGreen/30"
                {...props.attributes}
              >
                🍕 {props.children}
              </Badge>
            )}
          />
        </div>

        {/* Interactive carousel */}
        <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <DynamicCarousel />
        </div>
      </div>
    </section>
  )
}

//========================================
// Brick Schema
//========================================
LLLWelcomingSection.schema = {
  name: 'lll-welcoming-section',
  label: 'Welcoming Section',
  category: 'Little Latte Lane',
  
  // Sidebar controls
  sideEditProps: [
    {
      name: 'spacing',
      label: 'Spacing',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'large', label: 'Large' },
          { value: 'small', label: 'Small' },
        ],
      },
    },
    {
      name: 'showPersonalGreeting',
      label: 'Show Personal Greeting',
      type: types.SideEditPropType.Boolean,
    },
  ],

  // Default values
  getDefaultProps: () => ({
    mainHeading: 'Welcome to Little Latte Lane',
    personalGreeting: `Welcome back, Friend!`,
    subtitle: 'Premium coffee, fresh food & virtual golf in the heart of your neighborhood',
    badge1: 'Fresh Coffee',
    badge2: 'Virtual Golf', 
    badge3: 'Fresh Food',
    spacing: 'normal',
    showPersonalGreeting: true,
  }),
}

export default LLLWelcomingSection