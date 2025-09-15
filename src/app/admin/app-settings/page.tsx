'use client'

import React, { useEffect } from 'react'
import { Admin, AppSettings } from 'react-bricks'

export default function AppSettingsPage() {
  useEffect(() => {
    document.title = 'React Bricks App Settings'
  }, [])

  return (
    <Admin>
      <AppSettings />
    </Admin>
  )
}