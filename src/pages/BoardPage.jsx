import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { boardsMeta } from '../data.js'
import { fetchPosts, formatPostDate } from '../lib/postsApi.js'
import SectionTitle from '../components/SectionTitle.jsx'
import CtaBanner from '../components/CtaBanner.jsx'

export default function BoardPage({ board }) {
  const meta = boardsMeta[board]
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchPosts(board).then(({ posts: rows }) => {
      if (!mounted) return
      setPosts(rows)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [board])

  return (
    <>
      <div className="page">
        <SectionTitle eyebrow={meta.eyebrow} title={meta.label} sub={meta.sub} />

        {loading ? (
          <p className="empty">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <p className="empty">등록된 게시물이 없습니다.</p>
        ) : (
          <div className="bd-wrap">
            <table className="bd-table">
              <thead>
                <tr>
                  <th className="bd-col-no">번호</th>
                  <th className="bd-col-cat">분야</th>
                  <th className="bd-col-title">제목</th>
                  <th className="bd-col-file">서식파일</th>
                  <th className="bd-col-date">최종수정일</th>
                  <th className="bd-col-views">조회수</th>
                  <th className="bd-col-dept">담당부서</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="bd-col-no">{posts.length - idx}</td>
                    <td className="bd-col-cat">{p.category || '-'}</td>
                    <td className="bd-col-title">
                      <Link to={`/${board}/${p.id}`}>{p.title}</Link>
                    </td>
                    <td className="bd-col-file">
                      {p.attachments && p.attachments.length > 0 ? (
                        <span className="bd-file-badge">📎 {p.attachments.length}</span>
                      ) : (
                        <span className="bd-dash">-</span>
                      )}
                    </td>
                    <td className="bd-col-date">{formatPostDate(p.updated_at || p.created_at)}</td>
                    <td className="bd-col-views">{p.views ?? 0}</td>
                    <td className="bd-col-dept">{p.department || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CtaBanner />
    </>
  )
}
