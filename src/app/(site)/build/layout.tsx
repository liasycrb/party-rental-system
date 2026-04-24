export default function BuildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-0 flex-1">{children}</div>;
}
