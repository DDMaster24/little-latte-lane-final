import ReactBricksApp from '../admin-rb/ReactBricksApp'

export const metadata = {
  title: 'Preview - Little Latte Lane',
  description: 'Preview content for Little Latte Lane',
}

export default function PreviewLayout({
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