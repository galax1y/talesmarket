import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Providers } from '../components/providers'

export const Route = createRootRoute({
  component: () => (
    <Providers>
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="container mx-auto flex-1">
          <div className="p-2 flex gap-2">
            <Link to="/" className="[&.active]:font-bold [&.active]:underline">
              Instance coins
            </Link>{' '}
            <Link
              to="/dummy"
              className="[&.active]:font-bold [&.active]:underline"
            >
              Dummy
            </Link>{' '}
            <Link
              to="/buymarket"
              className="[&.active]:font-bold [&.active]:underline"
            >
              Buymarket
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </Providers>
  )
})
