import Link from 'next/link'
import { types } from 'react-bricks/rsc'

const NextLink: types.RenderLocalLink = ({
  href,
  className,
  children,
}) => {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export default NextLink