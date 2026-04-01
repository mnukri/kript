import Link from 'next/link'

interface StatCardProps {
  label: string
  value: string | number
  sub?:  string
  href?: string
}

export default function StatCard({ label, value, sub, href }: StatCardProps) {
  const inner = (
    <>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </>
  )
  if (href) {
    return (
      <Link href={href} className="block bg-white border border-zinc-200 rounded-lg p-5 hover:border-zinc-400 transition-colors">
        {inner}
      </Link>
    )
  }
  return <div className="bg-white border border-zinc-200 rounded-lg p-5">{inner}</div>
}
