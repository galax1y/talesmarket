import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
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
          </Link>
        </div>

        <Outlet />
      </div>
    </div>
  )
})
