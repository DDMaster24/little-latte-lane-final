import ReactBricksApp from './ReactBricksApp'

export const metadata = {
  title: 'Little Latte Lane - Content Admin',
  description: 'Content management system for Little Latte Lane',
}

export default function AdminRbLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-darkBg">
      <ReactBricksApp>{children}</ReactBricksApp>
    </div>
  )
}