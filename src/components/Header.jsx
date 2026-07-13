import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { company } from '../data.js'

const menu = [
  { to: '/about', label: '회사소개' },
  { to: '/listings', label: '매물정보' },
  { to: '/process', label: '계약절차안내' },
  { to: '/policy', label: '부동산정책' },
  { to: '/contact', label: '문의' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="hdr">
      <div className="hdr-inner container">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-text">
            <span className="logo-mark"><span className="logo-e">e</span><span className="logo-name">스타필드</span></span>
            <small>공인중개사사무소</small>
          </span>
        </Link>
        <nav className={`hdr-nav ${open ? 'is-open' : ''}`}>
          {menu.map((m) => (
            <NavLink key={m.to} to={m.to} onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <a className="hdr-cta" href={`tel:${company.phone.replace(/-/g, '')}`}>📞 {company.phone}</a>
        <button className="hdr-toggle" aria-label="메뉴" onClick={() => setOpen(!open)}>☰</button>
      </div>
    </header>
  )
}
