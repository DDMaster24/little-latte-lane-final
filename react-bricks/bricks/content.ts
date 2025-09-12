import { types } from 'react-bricks/rsc'

import RichTextBrick from './content/RichTextBrick'
import ImageGalleryBrick, { GalleryImageBrick } from './content/ImageGalleryBrick'
import TestimonialBrick, { TestimonialItemBrick } from './content/TestimonialBrick'
import CallToActionBrick from './content/CallToActionBrick'
import StatsBrick, { StatItemBrick } from './content/StatsBrick'

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
export { 
  RichTextBrick, 
  ImageGalleryBrick, 
  GalleryImageBrick,
  TestimonialBrick,
  TestimonialItemBrick,
  CallToActionBrick,
  StatsBrick,
  StatItemBrick
}
