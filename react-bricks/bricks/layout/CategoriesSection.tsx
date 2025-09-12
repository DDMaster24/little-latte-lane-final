'use client';

import { Text, types } from 'react-bricks'
import { Coffee, Pizza, Sandwich, Cookie, Salad, Soup } from 'lucide-react'

//=============================
// Local Types
//=============================
interface CategoriesSectionProps {
  title: string
  subtitle: string
  titleColor: string
  subtitleColor: string
  // Category 1
  category1Title: string
  category1Description: string
  category1Icon: string
  category1Link: string
  // Category 2
  category2Title: string
  category2Description: string
  category2Icon: string
  category2Link: string
  // Category 3
  category3Title: string
  category3Description: string
  category3Icon: string
  category3Link: string
  // Category 4
  category4Title: string
  category4Description: string
  category4Icon: string
  category4Link: string
}

//=============================
// Component to be rendered
//=============================
const CategoriesSection: types.Brick<CategoriesSectionProps> = ({
  title,
  subtitle,
  titleColor = 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
  subtitleColor = 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto',
  // Category props
  category1Title,
  category1Description,
  category1Icon,
  category1Link,
  category2Title,
  category2Description,
  category2Icon,
  category2Link,
  category3Title,
  category3Description,
  category3Icon,
  category3Link,
  category4Title,
  category4Description,
  category4Icon,
  category4Link,
}) => {
  // Icon resolver function
  const getIcon = (iconName: string) => {
    const iconMap = {
      coffee: Coffee,
      pizza: Pizza,
      sandwich: Sandwich,
      cookie: Cookie,
      salad: Salad,
      soup: Soup,
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Coffee
    return <IconComponent className="h-8 w-8" />
  }
  return (
    <section className="bg-darkBg section-padding">
      <div className="container mx-auto text-center">
        <Text
          propName="title"
          value={title}
          renderBlock={(props) => (
            <h2 className={titleColor}>
              {props.children}
            </h2>
          )}
          placeholder="🍽️ View Our Categories"
        />
        
        <Text
          propName="subtitle"
          value={subtitle}
          renderBlock={(props) => (
            <p className={subtitleColor}>
              {props.children}
            </p>
          )}
          placeholder="Explore our delicious menu categories"
        />
        
        {/* Dynamic Category Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {/* Category 1 */}
          <div className="group bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-neonCyan/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-neonCyan group-hover:text-neonPink transition-colors">
                {getIcon(category1Icon)}
              </div>
              <Text
                propName="category1Title"
                value={category1Title}
                renderBlock={(props) => (
                  <h3 className="text-xl font-bold text-white mb-2">
                    {props.children}
                  </h3>
                )}
                placeholder="Coffee & Beverages"
              />
              <Text
                propName="category1Description"
                value={category1Description}
                renderBlock={(props) => (
                  <p className="text-gray-300 text-sm mb-4">
                    {props.children}
                  </p>
                )}
                placeholder="Premium coffee, teas, and refreshing drinks"
              />
              <Text
                propName="category1Link"
                value={category1Link}
                renderBlock={(props) => (
                  <a 
                    href={`/menu/${props.children}`}
                    className="text-neonCyan hover:text-neonPink transition-colors text-sm font-medium"
                  >
                    View Menu →
                  </a>
                )}
                placeholder="coffee"
              />
            </div>
          </div>

          {/* Category 2 */}
          <div className="group bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-neonPink/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-neonPink group-hover:text-neonCyan transition-colors">
                {getIcon(category2Icon)}
              </div>
              <Text
                propName="category2Title"
                value={category2Title}
                renderBlock={(props) => (
                  <h3 className="text-xl font-bold text-white mb-2">
                    {props.children}
                  </h3>
                )}
                placeholder="Pizza & Mains"
              />
              <Text
                propName="category2Description"
                value={category2Description}
                renderBlock={(props) => (
                  <p className="text-gray-300 text-sm mb-4">
                    {props.children}
                  </p>
                )}
                placeholder="Artisanal pizzas and hearty main dishes"
              />
              <Text
                propName="category2Link"
                value={category2Link}
                renderBlock={(props) => (
                  <a 
                    href={`/menu/${props.children}`}
                    className="text-neonPink hover:text-neonCyan transition-colors text-sm font-medium"
                  >
                    View Menu →
                  </a>
                )}
                placeholder="pizza"
              />
            </div>
          </div>

          {/* Category 3 */}
          <div className="group bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-yellow-400 group-hover:text-neonCyan transition-colors">
                {getIcon(category3Icon)}
              </div>
              <Text
                propName="category3Title"
                value={category3Title}
                renderBlock={(props) => (
                  <h3 className="text-xl font-bold text-white mb-2">
                    {props.children}
                  </h3>
                )}
                placeholder="Sandwiches & Wraps"
              />
              <Text
                propName="category3Description"
                value={category3Description}
                renderBlock={(props) => (
                  <p className="text-gray-300 text-sm mb-4">
                    {props.children}
                  </p>
                )}
                placeholder="Fresh sandwiches, wraps, and light meals"
              />
              <Text
                propName="category3Link"
                value={category3Link}
                renderBlock={(props) => (
                  <a 
                    href={`/menu/${props.children}`}
                    className="text-yellow-400 hover:text-neonCyan transition-colors text-sm font-medium"
                  >
                    View Menu →
                  </a>
                )}
                placeholder="sandwiches"
              />
            </div>
          </div>

          {/* Category 4 */}
          <div className="group bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-green-400 group-hover:text-neonPink transition-colors">
                {getIcon(category4Icon)}
              </div>
              <Text
                propName="category4Title"
                value={category4Title}
                renderBlock={(props) => (
                  <h3 className="text-xl font-bold text-white mb-2">
                    {props.children}
                  </h3>
                )}
                placeholder="Desserts & Treats"
              />
              <Text
                propName="category4Description"
                value={category4Description}
                renderBlock={(props) => (
                  <p className="text-gray-300 text-sm mb-4">
                    {props.children}
                  </p>
                )}
                placeholder="Sweet treats, pastries, and desserts"
              />
              <Text
                propName="category4Link"
                value={category4Link}
                renderBlock={(props) => (
                  <a 
                    href={`/menu/${props.children}`}
                    className="text-green-400 hover:text-neonPink transition-colors text-sm font-medium"
                  >
                    View Menu →
                  </a>
                )}
                placeholder="desserts"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

//=============================
// Brick SCHEMA
//=============================
CategoriesSection.schema = {
  name: 'categories-section',
  label: 'Categories Section',
  category: 'layout',
  tags: ['categories', 'menu', 'section'],
  
  // Default props when brick is added
  getDefaultProps: () => ({
    title: '🍽️ Our Menu Categories',
    subtitle: 'Explore our carefully curated selection of premium coffee, fresh food, and delightful treats',
    titleColor: 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4',
    subtitleColor: 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto',
    // Category 1 - Coffee
    category1Title: 'Coffee & Beverages',
    category1Description: 'Premium coffee, teas, and refreshing drinks',
    category1Icon: 'coffee',
    category1Link: 'coffee',
    // Category 2 - Pizza  
    category2Title: 'Pizza & Mains',
    category2Description: 'Artisanal pizzas and hearty main dishes',
    category2Icon: 'pizza',
    category2Link: 'pizza',
    // Category 3 - Sandwiches
    category3Title: 'Sandwiches & Wraps', 
    category3Description: 'Fresh sandwiches, wraps, and light meals',
    category3Icon: 'sandwich',
    category3Link: 'sandwiches',
    // Category 4 - Desserts
    category4Title: 'Desserts & Treats',
    category4Description: 'Sweet treats, pastries, and desserts',
    category4Icon: 'cookie',
    category4Link: 'desserts',
  }),

  // Sidebar controls for editing
  sideEditProps: [
    {
      name: 'title',
      label: 'Section Title',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'subtitle',
      label: 'Section Subtitle',
      type: types.SideEditPropType.Text,
    },
    {
      name: 'titleColor',
      label: 'Title Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-3xl font-bold bg-neon-gradient bg-clip-text text-transparent mb-4', label: 'Neon Gradient (Default)' },
          { value: 'text-3xl font-bold text-neonCyan mb-4', label: 'Neon Cyan' },
          { value: 'text-3xl font-bold text-neonPink mb-4', label: 'Neon Pink' },
          { value: 'text-3xl font-bold text-white mb-4', label: 'White' },
          { value: 'text-3xl font-bold text-gray-300 mb-4', label: 'Light Gray' },
          { value: 'text-3xl font-bold text-yellow-400 mb-4', label: 'Yellow' },
          { value: 'text-3xl font-bold text-blue-400 mb-4', label: 'Blue' },
          { value: 'text-3xl font-bold text-green-400 mb-4', label: 'Green' },
        ],
      },
    },
    {
      name: 'subtitleColor',
      label: 'Subtitle Color',
      type: types.SideEditPropType.Select,
      selectOptions: {
        display: types.OptionsDisplay.Select,
        options: [
          { value: 'text-lg text-gray-300 mb-8 max-w-2xl mx-auto', label: 'Gray 300 (Default)' },
          { value: 'text-lg text-white mb-8 max-w-2xl mx-auto', label: 'White' },
          { value: 'text-lg text-neonCyan mb-8 max-w-2xl mx-auto', label: 'Neon Cyan' },
          { value: 'text-lg text-neonPink mb-8 max-w-2xl mx-auto', label: 'Neon Pink' },
          { value: 'text-lg text-gray-400 mb-8 max-w-2xl mx-auto', label: 'Gray 400' },
          { value: 'text-lg text-yellow-300 mb-8 max-w-2xl mx-auto', label: 'Yellow' },
          { value: 'text-lg text-blue-300 mb-8 max-w-2xl mx-auto', label: 'Blue' },
          { value: 'text-lg text-green-300 mb-8 max-w-2xl mx-auto', label: 'Green' },
        ],
      },
    },
    {
      groupName: 'Category 1 - Coffee & Beverages',
      props: [
        {
          name: 'category1Title',
          label: 'Category 1 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'category1Description',
          label: 'Category 1 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'category1Icon',
          label: 'Category 1 Icon',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'coffee', label: '☕ Coffee' },
              { value: 'pizza', label: '🍕 Pizza' },
              { value: 'sandwich', label: '🥪 Sandwich' },
              { value: 'cookie', label: '🍪 Cookie' },
              { value: 'salad', label: '🥗 Salad' },
              { value: 'soup', label: '🍜 Soup' },
            ],
          },
        },
        {
          name: 'category1Link',
          label: 'Category 1 Link (menu slug)',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Category 2 - Pizza & Mains',
      props: [
        {
          name: 'category2Title',
          label: 'Category 2 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'category2Description',
          label: 'Category 2 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'category2Icon',
          label: 'Category 2 Icon',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'coffee', label: '☕ Coffee' },
              { value: 'pizza', label: '🍕 Pizza' },
              { value: 'sandwich', label: '🥪 Sandwich' },
              { value: 'cookie', label: '🍪 Cookie' },
              { value: 'salad', label: '🥗 Salad' },
              { value: 'soup', label: '🍜 Soup' },
            ],
          },
        },
        {
          name: 'category2Link',
          label: 'Category 2 Link (menu slug)',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Category 3 - Sandwiches & Wraps',
      props: [
        {
          name: 'category3Title',
          label: 'Category 3 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'category3Description',
          label: 'Category 3 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'category3Icon',
          label: 'Category 3 Icon',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'coffee', label: '☕ Coffee' },
              { value: 'pizza', label: '🍕 Pizza' },
              { value: 'sandwich', label: '🥪 Sandwich' },
              { value: 'cookie', label: '🍪 Cookie' },
              { value: 'salad', label: '🥗 Salad' },
              { value: 'soup', label: '🍜 Soup' },
            ],
          },
        },
        {
          name: 'category3Link',
          label: 'Category 3 Link (menu slug)',
          type: types.SideEditPropType.Text,
        },
      ],
    },
    {
      groupName: 'Category 4 - Desserts & Treats',
      props: [
        {
          name: 'category4Title',
          label: 'Category 4 Title',
          type: types.SideEditPropType.Text,
        },
        {
          name: 'category4Description',
          label: 'Category 4 Description',
          type: types.SideEditPropType.Textarea,
        },
        {
          name: 'category4Icon',
          label: 'Category 4 Icon',
          type: types.SideEditPropType.Select,
          selectOptions: {
            display: types.OptionsDisplay.Select,
            options: [
              { value: 'coffee', label: '☕ Coffee' },
              { value: 'pizza', label: '🍕 Pizza' },
              { value: 'sandwich', label: '🥪 Sandwich' },
              { value: 'cookie', label: '🍪 Cookie' },
              { value: 'salad', label: '🥗 Salad' },
              { value: 'soup', label: '🍜 Soup' },
            ],
          },
        },
        {
          name: 'category4Link',
          label: 'Category 4 Link (menu slug)',
          type: types.SideEditPropType.Text,
        },
      ],
    },
  ],
};

export default CategoriesSection;
