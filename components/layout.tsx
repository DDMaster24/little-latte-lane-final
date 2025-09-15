export default function PageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="flex flex-col h-screen justify-between">{children}</div>
}