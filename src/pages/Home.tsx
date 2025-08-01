
export default function Home() {
  return (
    <div className="home">
      <h1>不如</h1>
      <p>珍藏回忆，让时间漂流</p>
      <div className="home-actions">
        <a href="/memories" className="btn btn-primary">回忆集</a>
        <a href="/first-encounter" className="btn btn-secondary">重返初遇</a>
      </div>
    </div>
  )
}