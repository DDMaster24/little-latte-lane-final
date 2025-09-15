import { ReactBricksApp } from '@/components/ReactBricksApp'

export const metadata = {
  title: 'React Bricks Admin - Little Latte Lane',
  description: 'Content Management System for Little Latte Lane',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactBricksApp>{children}</ReactBricksApp>
  )
}