import { Link } from "react-router-dom"

function ArticleCard({ article }) {
 console.log("Article data:", JSON.stringify(article, null, 2))   // ← temporary debug line

  return (
    <Link to={`/article/${article._id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 h-full">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-48 object-cover"
        />

        <div className="p-5">
          <span className="text-sm text-blue-600 font-medium">
            {article.category}
          </span>

          <h2 className="text-xl font-semibold mt-2 mb-2 line-clamp-2">
            {article.title}
          </h2>

          <p className="text-gray-600 text-sm line-clamp-3">
            {article.description}
          </p>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>{article.source}</span>
            <span>{article.date || new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ArticleCard