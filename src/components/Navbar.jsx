function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          NewsAggregator
        </h1>

        <div className="space-x-6">
          <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            Categories
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            About
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar