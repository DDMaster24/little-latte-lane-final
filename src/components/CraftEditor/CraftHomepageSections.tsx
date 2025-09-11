'use client';

import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { 
  CraftText, 
  CraftImage, 
  CraftContainer, 
  CraftButton 
} from './SimpleCraftComponents';

// Editable Hero Section (matches your WelcomingSection)
export const CraftHeroSection = ({ 
  mainHeading = "Welcome to Little Latte Lane",
  subHeading = "Café & Deli - Where Great Food Meets Amazing Experiences",
  badgeText1 = "Now Open",
  badgeText2 = "Dine In • Takeaway • Delivery",
  ctaHeading = "Ready to Experience Little Latte Lane?",
  ctaDescription = "Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere."
}: {
  mainHeading?: string;
  subHeading?: string;
  badgeText1?: string;
  badgeText2?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="bg-gradient-to-br from-darkBg via-gray-900 to-darkBg px-4 py-16"
    >
      <div className="container mx-auto text-center space-y-8">
        {/* Main Hero */}
        <Element
          is={CraftText}
          text={mainHeading}
          fontSize={48}
          color="#ffffff"
          textAlign="center"
        />
        
        <Element
          is={CraftText}
          text={subHeading}
          fontSize={24}
          color="#d1d5db"
          textAlign="center"
        />

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          <Element
            is={CraftButton}
            text={badgeText1}
            backgroundColor="#06b6d4"
            color="#000000"
            fontSize={14}
          />
          <Element
            is={CraftButton}
            text={badgeText2}
            backgroundColor="#ec4899"
            color="#000000"
            fontSize={14}
          />
        </div>

        {/* CTA Section */}
        <div className="mt-16 space-y-6">
          <Element
            is={CraftText}
            text={ctaHeading}
            fontSize={32}
            color="#ffffff"
            textAlign="center"
          />
          
          <Element
            is={CraftText}
            text={ctaDescription}
            fontSize={18}
            color="#d1d5db"
            textAlign="center"
          />
        </div>
      </div>
    </div>
  );
};

// Editable Categories Section
export const CraftCategoriesSection = ({
  heading = "🍽️ View Our Categories",
  description = "Discover our amazing selection of food, drinks, and experiences",
  category1 = "Coffee & Drinks",
  category2 = "Fresh Food", 
  category3 = "Virtual Golf",
  category4 = "Special Events"
}: {
  heading?: string;
  description?: string;
  category1?: string;
  category2?: string;
  category3?: string;
  category4?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50"
    >
      <div className="text-center space-y-8">
        <Element
          is={CraftText}
          text={heading}
          fontSize={32}
          color="#ffffff"
          textAlign="center"
        />
        
        <Element
          is={CraftText}
          text={description}
          fontSize={18}
          color="#d1d5db"
          textAlign="center"
        />

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[category1, category2, category3, category4].map((category, index) => (
            <Element
              key={index}
              is={CraftContainer}
              backgroundColor="rgba(75, 85, 99, 0.3)"
              padding={20}
            >
              <Element
                is={CraftText}
                text={category}
                fontSize={20}
                color="#ffffff"
                textAlign="center"
              />
            </Element>
          ))}
        </div>
      </div>
    </div>
  );
};

// Editable Events Section
export const CraftEventsSection = ({
  heading = "🎉 Events & Specials",
  eventTitle = "Weekly Happy Hour",
  eventDescription = "Join us every Friday from 5-7 PM for discounted drinks and appetizers",
  buttonText = "Learn More"
}: {
  heading?: string;
  eventTitle?: string;
  eventDescription?: string;
  buttonText?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className="bg-gradient-to-r from-pink-500/10 to-cyan-500/10 rounded-xl p-8"
    >
      <div className="text-center space-y-6">
        <Element
          is={CraftText}
          text={heading}
          fontSize={32}
          color="#ffffff"
          textAlign="center"
        />
        
        <Element
          is={CraftText}
          text={eventTitle}
          fontSize={24}
          color="#ffffff"
          textAlign="center"
        />
        
        <Element
          is={CraftText}
          text={eventDescription}
          fontSize={16}
          color="#d1d5db"
          textAlign="center"
        />

        <Element
          is={CraftButton}
          text={buttonText}
          backgroundColor="#06b6d4"
          color="#ffffff"
          fontSize={16}
        />
      </div>
    </div>
  );
};

// Settings panels for custom components
const CraftHeroSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props
  }));

  return (
    <div className="bg-gray-800 p-4 space-y-4">
      <h3 className="text-white font-semibold">Hero Section Settings</h3>
      <div>
        <label className="text-white text-sm">Main Heading:</label>
        <input
          value={props.mainHeading}
          onChange={(e) => setProp((props: any) => props.mainHeading = e.target.value)}
          className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
        />
      </div>
      <div>
        <label className="text-white text-sm">Sub Heading:</label>
        <input
          value={props.subHeading}
          onChange={(e) => setProp((props: any) => props.subHeading = e.target.value)}
          className="w-full mt-1 p-2 bg-gray-700 text-white rounded"
        />
      </div>
    </div>
  );
};

// Assign settings
CraftHeroSection.craft = {
  props: {
    mainHeading: "Welcome to Little Latte Lane",
    subHeading: "Café & Deli - Where Great Food Meets Amazing Experiences",
    badgeText1: "Now Open",
    badgeText2: "Dine In • Takeaway • Delivery",
    ctaHeading: "Ready to Experience Little Latte Lane?",
    ctaDescription: "Join us for exceptional food, premium beverages, and a warm, welcoming atmosphere."
  },
  related: {
    settings: CraftHeroSectionSettings
  }
};

CraftCategoriesSection.craft = {
  props: {
    heading: "🍽️ View Our Categories",
    description: "Discover our amazing selection of food, drinks, and experiences",
    category1: "Coffee & Drinks",
    category2: "Fresh Food",
    category3: "Virtual Golf", 
    category4: "Special Events"
  }
};

CraftEventsSection.craft = {
  props: {
    heading: "🎉 Events & Specials",
    eventTitle: "Weekly Happy Hour",
    eventDescription: "Join us every Friday from 5-7 PM for discounted drinks and appetizers",
    buttonText: "Learn More"
  }
};
