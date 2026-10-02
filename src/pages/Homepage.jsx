import { useState, useEffect } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import SearchBar from "../components/SearchBar"
import CategoryFilter from "../components/CategoryFilter"
import ArticleCard from "../components/ArticleCard"

function HomePage() {
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categories = ["Technology", "Business", "Science", "Lifestyle", "Sports", "Health"]

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/api/articles")
        setArticles(response.data)
        setError(null)
      } catch (err) {
        setError("Failed to load articles. Make sure the backend is running.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === "All" || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">
          Latest News
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Stay updated with the most important stories from around the world
        </p>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {loading ? (
          <p className="text-center text-gray-500 text-lg mt-16">Loading articles...</p>
        ) : error ? (
          <p className="text-center text-red-500 text-lg mt-16">{error}</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-16">No articles found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage