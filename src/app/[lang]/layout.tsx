import React from 'react'
import { ReactBricksApp } from '@/components/ReactBricksApp'
import { Locale } from '../../../i18n-config'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}

export default async function LangLayout(props: LayoutProps) {
  const params = await props.params
  const { children } = props
  
  return (
    <ReactBricksApp lang={params.lang}>
      {children}
    </ReactBricksApp>
  )
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
  ]
}