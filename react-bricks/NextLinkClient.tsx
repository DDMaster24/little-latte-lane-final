'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NextLinkClientProps {
  href: string
  target?: string
  rel?: string
  className?: string
  activeClassName?: string
  children?: React.ReactNode
}

const NextLinkClient: React.FC<NextLinkClientProps> = ({
  href,
  target,
  rel,
  className,
  activeClassName,
  children,
}) => {
  const pathname = usePathname()

  let anchorClassName = ''

  if (pathname === href) {
    anchorClassName = `${className} ${activeClassName}`
  } else {
    anchorClassName = className || ''
  }

  return (
    <Link href={href} target={target} rel={rel} className={anchorClassName}>
      {children}
    </Link>
  )
}

export default NextLinkClient