import React from 'react'
import { redirect } from 'next/navigation'

export default async function Home() {
  // Redirect to the React Bricks homepage
  redirect('/en/homepage')
}