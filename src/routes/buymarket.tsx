import { createFileRoute } from '@tanstack/react-router'
import { BuymarketViewer } from '../components/buymarket-viewer'

export const Route = createFileRoute('/buymarket')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <div className="p-2">
      <BuymarketViewer />
    </div>
  )
}
