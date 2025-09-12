import { types } from 'react-bricks/rsc'

// Content Bricks - Rich content and interactive elements
export { default as RichTextBrick } from './RichTextBrick'
export { default as ImageGalleryBrick, GalleryImageBrick } from './ImageGalleryBrick'
export { default as TestimonialBrick, TestimonialItemBrick } from './TestimonialBrick'
export { default as CallToActionBrick } from './CallToActionBrick'
export { default as StatsBrick, StatItemBrick } from './StatsBrick'

// Import all content bricks
import RichTextBrick from './RichTextBrick'
import ImageGalleryBrick, { GalleryImageBrick } from './ImageGalleryBrick'
import TestimonialBrick, { TestimonialItemBrick } from './TestimonialBrick'
import CallToActionBrick from './CallToActionBrick'
import StatsBrick, { StatItemBrick } from './StatsBrick'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const content: types.Brick<any>[] = [
  RichTextBrick,
  ImageGalleryBrick,
  GalleryImageBrick,
  TestimonialBrick,
  TestimonialItemBrick,
  CallToActionBrick,
  StatsBrick,
  StatItemBrick,
]

export default content
