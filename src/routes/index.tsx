import { createFileRoute } from '@tanstack/react-router'
import { CoinsViewer } from '../components/coins-viewer'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  return (
    <div className="p-2">
      <CoinsViewer />
    </div>
  )
}
