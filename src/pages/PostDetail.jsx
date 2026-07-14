import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { boardsMeta } from '../data.js'
import { fetchPost, fetchPosts, incrementPostViews, postFileUrl, formatPostDate } from '../lib/postsApi.js'

const FIELD_ROWS = [
  ['department', '담당부서'],
  ['phone', '전화번호'],
  ['duration', '처리기간'],
  ['fee', '수수료'],
  ['how_to_apply', '신청/접수방법'],
  ['required_docs', '구비서류'],
  ['steps', '처리절차'],
  ['related_law', '관계법령'],
  ['etc_note', '기타사항'],
]

export default function PostDetail({ board }) {
  const { id } = useParams()
  const meta = boardsMeta[board]
  const [post, setPost] = useState(null)
  const [neighbors, setNeighbors] = useState({ prev: null, next: null })
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    Promise.all([fetchPost(board, id), fetchPosts(board)]).then(([{ post: row, fallback }, { posts: list }]) => {
      if (!mounted) return
      setPost(row)
      setIsFallback(fallback)
      const idx = list.findIndex((p) => String(p.id) === String(id))
      setNeighbors({
        next: idx > 0 ? list[idx - 1] : null, // 다음글 = 더 최신
        prev: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null, // 이전글 = 더 과거
      })
      setLoading(false)
      if (row && !fallback) incrementPostViews(row.id)
    })
    return () => {
      mounted = false
    }
  }, [board, id])

  if (loading) {
    return (
      <div className="page">
        <p className="empty">불러오는 중…</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page">
        <p className="empty">게시물을 찾을 수 없습니다.</p>
        <div className="pd-actions">
          <Link className="btn btn-navy" to={`/${board}`}>목록</Link>
        </div>
      </div>
    )
  }

  const attachments = post.attachments || []

  return (
    <div className="page pd-page">
      <div className="pd-title-card">
        <h1>{post.title}</h1>
      </div>

      {post.category && (
        <p className="pd-cat">
          <span>분야</span> {post.category}
        </p>
      )}

      <ul className="pd-rows">
        {FIELD_ROWS.map(([key, label]) =>
          post[key] ? (
            <li key={key}>
              <span className="pd-label">{label}</span>
              <div className="pd-value">{post[key]}</div>
            </li>
          ) : null,
        )}
        {attachments.length > 0 && (
          <li>
            <span className="pd-label">서식파일</span>
            <div className="pd-value">
              <ul className="pd-files">
                {attachments.map((f) => (
                  <li key={f.path}>
                    <a className="pd-file-name" href={postFileUrl(f.path, f.name)}>
                      📄 {f.name} <span className="pd-dl">⤓</span>
                    </a>
                    <a className="pd-file-preview" href={postFileUrl(f.path)} target="_blank" rel="noreferrer">
                      미리보기 🔍
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}
      </ul>

      {post.content && <div className="pd-content">{post.content}</div>}

      <div className="pd-actions">
        <span className="pd-meta">
          최종수정일 {formatPostDate(post.updated_at || post.created_at)}
          {!isFallback && <> · 조회수 {post.views ?? 0}</>}
        </span>
        <Link className="btn btn-navy" to={`/${board}`}>목록</Link>
      </div>

      {(neighbors.prev || neighbors.next) && (
        <ul className="pd-nav">
          {neighbors.prev && (
            <li>
              <span className="pd-label">이전글</span>
              <Link to={`/${board}/${neighbors.prev.id}`}>{neighbors.prev.title}</Link>
            </li>
          )}
          {neighbors.next && (
            <li>
              <span className="pd-label">다음글</span>
              <Link to={`/${board}/${neighbors.next.id}`}>{neighbors.next.title}</Link>
            </li>
          )}
        </ul>
      )}

      <p className="pd-board-back">
        <Link to={`/${board}`}>← {meta.label} 목록으로</Link>
      </p>
    </div>
  )
}
