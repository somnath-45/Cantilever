import { useState } from 'react'
import { getBlogsByTopic } from '../api/client'

export default function Explore() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const data = await getBlogsByTopic(query.trim())
      setResults(data)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Explore</div>
      </div>

      <div className="page-body">
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', marginBottom: 20 }}>
          Search for posts by topic to discover what others are writing about.
        </p>

        <form onSubmit={handleSearch} className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="Search by topic…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="spinner"><div className="spinner-dot" /><div className="spinner-dot" /><div className="spinner-dot" /></div>
        )}

        {!loading && searched && results !== null && (
          results.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">◉</div>
              <div className="empty-title">No posts found</div>
              <div className="empty-text">No posts match the topic "{query}". Try a different term.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)', marginBottom: 16 }}>
                {results.length} post{results.length !== 1 ? 's' : ''} found for "{query}"
              </div>
              <div className="blog-grid">
                {results.map(b => (
                  <div key={b.id} className="blog-card">
                    <span className="blog-topic">{b.topic}</span>
                    <p className="blog-text" style={{ WebkitLineClamp: 'unset', display: 'block' }}>{b.text}</p>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-faint)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>◉</div>
            <div style={{ fontSize: '0.9rem' }}>Enter a topic above to start exploring</div>
          </div>
        )}
      </div>
    </>
  )
}
