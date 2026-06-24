import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-[#41398B] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
      >
        Return Home
      </Link>
    </div>
  )
}
