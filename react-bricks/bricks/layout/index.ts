import { types } from 'react-bricks/rsc'

import WelcomingSection from './WelcomingSection'
import CategoriesSection from './CategoriesSection'
import EventsSpecialsSection from './EventsSpecialsSection'
import BookingsSection from './BookingsSection'
import HeaderBrick from './HeaderBrick'
import FooterBrick from './FooterBrick'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const layout: types.Brick<any>[] = [
  WelcomingSection,
  CategoriesSection,
  EventsSpecialsSection,
  BookingsSection,
  HeaderBrick,
  FooterBrick,
]

export default layout
