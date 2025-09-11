import { types } from 'react-bricks/rsc'

import WelcomingSection from './WelcomingSection'
import CategoriesSection from './CategoriesSection'
import EventsSpecialsSection from './EventsSpecialsSection'
import BookingsSection from './BookingsSection'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const layout: types.Brick<any>[] = [
  WelcomingSection,
  CategoriesSection,
  EventsSpecialsSection,
  BookingsSection,
]

export default layout
