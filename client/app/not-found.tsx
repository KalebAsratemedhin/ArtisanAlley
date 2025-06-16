export default function NotFound() {
  return (
    <div className="container max-w-2xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-8">Sorry, the page you are looking for does not exist.</p>
      <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Go Home</a>
    </div>
  )
} 