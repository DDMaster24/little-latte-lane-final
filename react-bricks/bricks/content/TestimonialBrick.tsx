import React from 'react'
import { types, Text, Image, Repeater } from 'react-bricks/rsc'
import { Star, Quote } from 'lucide-react'

//========================================
// TestimonialBrick - Customer Reviews & Testimonials
//========================================

interface TestimonialBrickProps {
  backgroundColor: string
  layout: 'grid' | 'carousel' | 'single'
  showRatings: boolean
  showImages: boolean
  columns: 1 | 2 | 3
}

const TestimonialBrick: types.Brick<TestimonialBrickProps> = ({
  backgroundColor = 'bg-darkBg',
  layout: _layout = 'grid', // Future use for carousel/single layouts
  showRatings = true,
  showImages = true,
  columns = 2,
}) => {
  const columnClasses = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3'
  }

  return (
    <section className={`${backgroundColor} py-16 px-8`}>
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Text
            propName="title"
            placeholder="What Our Customers Say"
            value=""
            renderBlock={(props) => (
              <h2 className="text-4xl md:text-5xl font-bold text-neonCyan mb-4 leading-tight">
                {props.children}
              </h2>
            )}
          />
          
          <Text
            propName="subtitle"
            placeholder="Real reviews from real customers"
            value=""
            renderBlock={(props) => (
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {props.children}
              </p>
            )}
          />
        </div>

        {/* Testimonials Grid */}
        <div className={`grid grid-cols-1 ${columnClasses[columns]} gap-8`}>
          <Repeater
            propName="testimonials"
            items={[]}
            renderWrapper={(items) => <>{items}</>}
            renderItemWrapper={(item) => (
              <div className="group">
                {item}
              </div>
            )}
            itemProps={{
              showRatings,
              showImages,
            }}
          />
        </div>

        {/* Add Testimonial Note (visible in editor) */}
        <div className="text-center mt-12">
          <Text
            propName="addTestimonialText"
            placeholder="Click + to add testimonials above"
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

// Individual Testimonial Item Brick
interface TestimonialItemBrickProps {
  showRatings: boolean
  showImages: boolean
}

const TestimonialItemBrick: types.Brick<TestimonialItemBrickProps> = ({
  showRatings = true,
  showImages = true,
}) => {
  return (
    <div className="relative bg-black/20 backdrop-blur-sm border border-neonCyan/20 rounded-lg p-6 hover:border-neonPink/40 transition-all duration-300 group-hover:shadow-neon">
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 text-neonCyan/30">
        <Quote size={24} />
      </div>

      {/* Rating Stars */}
      {showRatings && (
        <div className="flex items-center gap-1 mb-4">
          <Text
            propName="rating"
            placeholder="5"
            value=""
            renderBlock={(props) => {
              const rating = parseInt(props.children?.toString() || '5')
              return (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= rating 
                          ? 'text-neonYellow fill-neonYellow' 
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )
            }}
          />
        </div>
      )}

      {/* Testimonial Text */}
      <div className="mb-6">
        <Text
          propName="testimonial"
          placeholder="Enter customer testimonial here..."
          value=""
          renderBlock={(props) => (
            <p className="text-gray-200 leading-relaxed italic text-lg">
              &ldquo;{props.children}&rdquo;
            </p>
          )}
        />
      </div>

      {/* Customer Info */}
      <div className="flex items-center gap-4">
        {showImages && (
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-neonCyan/30">
            <Image
              propName="customerImage"
              alt="Customer photo"
              source={{
                src: '/images/placeholder-avatar.jpg',
                placeholderSrc: '/images/placeholder-avatar.jpg',
                srcSet: '',
                alt: 'Customer photo'
              }}
              maxWidth={80}
              imageClassName="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <Text
            propName="customerName"
            placeholder="Customer Name"
            value=""
            renderBlock={(props) => (
              <h4 className="text-neonPink font-semibold">
                {props.children}
              </h4>
            )}
          />
          
          <Text
            propName="customerTitle"
            placeholder="Customer title or location"
            value=""
            renderBlock={(props) => (
              <p className="text-gray-400 text-sm">
                {props.children}
              </p>
            )}
          />
        </div>
      </div>

      {/* Date */}
      <div className="mt-4 pt-4 border-t border-neonCyan/10">
        <Text
          propName="date"
          placeholder="Review date"
          value=""
          renderBlock={(props) => (
            <p className="text-gray-500 text-xs">
              {props.children}
            </p>
          )}
        />
      </div>
    </div>
  )
}

TestimonialBrick.schema = {
  name: 'testimonials',
  label: 'Customer Testimonials',
  category: 'content',
  
  sideEditProps: [
    {
      name: 'backgroundColor',
      label: 'Background',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'bg-darkBg', label: 'Dark' },
          { value: 'bg-darkBg/95', label: 'Dark Transparent' },
          { value: 'bg-gradient-to-br from-darkBg to-black', label: 'Dark Gradient' },
          { value: 'bg-neon-gradient', label: 'Neon Gradient' },
          { value: 'bg-black/80', label: 'Black Transparent' },
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
          { value: 'carousel', label: 'Carousel' },
          { value: 'single', label: 'Single' },
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
          { value: 1, label: '1 Column' },
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
        ],
      },
    },
    {
      name: 'showRatings',
      label: 'Show Star Ratings',
      type: types.SideEditPropType.Boolean,
    },
    {
      name: 'showImages',
      label: 'Show Customer Photos',
      type: types.SideEditPropType.Boolean,
    },
  ],
  
  repeaterItems: [
    {
      name: 'testimonials',
      itemType: 'testimonial-item',
      itemLabel: 'Testimonial',
      min: 1,
      max: 9,
    },
  ],
}

TestimonialItemBrick.schema = {
  name: 'testimonial-item',
  label: 'Testimonial Item',
  category: 'content',
  hideFromAddMenu: true, // Only accessible through repeater
}

export default TestimonialBrick
export { TestimonialItemBrick }
