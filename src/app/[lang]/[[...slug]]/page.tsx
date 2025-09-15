import React from 'react'
import { PageViewer, fetchPage, fetchPages } from 'react-bricks/rsc'

import ErrorNoPage from '@/components/ErrorNoPage'
import config from '../../../../react-bricks/config'

interface PageProps {
  params: Promise<{
    lang: string
    slug?: string[]
  }>
}

export default async function Page(props: PageProps) {
  const params = await props.params
  const { lang, slug } = params
  const currentSlug = slug ? slug.join('/') : ''
  
  try {
    const page = await fetchPage({
      slug: currentSlug,
      language: lang,
      config,
    })
    
    if (!page) {
      return <ErrorNoPage />
    }

    return (
      <PageViewer page={page} />
    )
  } catch (error) {
    console.error('Error fetching page:', error)
    return <ErrorNoPage />
  }
}

export async function generateStaticParams({ params }: { params: { lang: string } }) {
  try {
    const pages = await fetchPages({
      language: params.lang,
      config,
    })
    
    if (Array.isArray(pages)) {
      return pages.map((page) => ({
        slug: page.slug === '/' ? [] : page.slug.split('/').filter(Boolean),
      }))
    }
    
    return []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}