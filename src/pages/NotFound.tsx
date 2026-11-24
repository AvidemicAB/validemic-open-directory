import { Link } from 'react-router-dom'
import OpenLayout from './open/OpenLayout'

export default function NotFound() {
  return (
    <OpenLayout>
      <section className="mx-auto max-w-xl px-6 py-28 text-center">
        <h1 className="text-3xl font-semibold text-ink-900">Page not found</h1>
        <Link to="/" className="mt-6 inline-block text-brand-700 hover:underline">Back to the directory</Link>
      </section>
    </OpenLayout>
  )
}
