import { createFileRoute } from '@tanstack/react-router'
import { DummyViewer } from '../components/dummy-viewer'

export const Route = createFileRoute('/dummy')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="p-2">
      <DummyViewer />
    </div>
  )
}
