import { signIn } from '@/auth'

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm w-full max-w-sm px-8 py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900">
            kri<span style={{ color: '#C8102E' }}>pt</span>
          </h1>
          <p className="text-sm text-zinc-500">Sign in to your account</p>
        </div>

        <form
          action={async () => {
            'use server'
            await signIn('microsoft-entra-id', { redirectTo: '/' })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <MicrosoftIcon />
            Sign in with Microsoft
          </button>
        </form>
      </div>
    </div>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}
