import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import axios from "axios"
import Navbar from "../components/Navbar"

function ArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/articles/${id}`)
        setArticle(response.data)
        setError(null)
      } catch (err) {
        setError("Article not found or server error")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center pt-20 text-gray-500">Loading article...</p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center pt-20">
          <h2 className="text-2xl font-bold">{error || "Article not found"}</h2>
          <Link to="/" className="text-blue-600 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Home
        </Link>

        <img
          src={article.image}
          alt={article.title}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />

        <span className="text-blue-600 font-medium">{article.category}</span>
        <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
          {article.title}
        </h1>

        <div className="flex gap-4 text-sm text-gray-500 mb-8">
          <span>{article.source}</span>
          <span>•</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>

        <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
          {article.content}
        </p>
      </div>
    </div>
  )
}

export default ArticlePage