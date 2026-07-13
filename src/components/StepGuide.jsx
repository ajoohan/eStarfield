export default function StepGuide({ items }) {
  return (
    <div className="step-grid">
      {items.map((s) => (
        <div key={s.no} className="step-card">
          <span className="step-no">{s.no}</span>
          <strong>{s.title}</strong>
          <p>{s.desc}</p>
        </div>
      ))}
    </div>
  )
}
