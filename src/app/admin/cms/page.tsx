'use client'

import React, { useEffect } from 'react'
import { Admin, Login } from 'react-bricks'

export default function CMSLoginPage() {
  useEffect(() => {
    document.title = 'React Bricks CMS Login - Little Latte Lane'
  }, [])

  return (
    <Admin isLogin>
      <Login />
    </Admin>
  )
}