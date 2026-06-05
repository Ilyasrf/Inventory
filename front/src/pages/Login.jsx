export default function Login() {
  const backendUrl = import.meta.env.VITE_API_URL || '';

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="logo">⚙️</div>
        <h1>MAKINA MASTERS</h1>
        <p className="subtitle">Robotics · AI · IoT — Inventory System</p>

        <a href={`${backendUrl}/auth/42`} className="btn-42">
          <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
            <polygon points="20,8 20,36 34,22 34,8" fill="white"/>
            <polygon points="20,36 34,22 34,50 20,50" fill="white" opacity="0.7"/>
            <polygon points="34,22 48,8 48,36 34,36" fill="white"/>
            <polygon points="34,36 48,36 48,50 34,50" fill="white" opacity="0.7"/>
          </svg>
          Login with 42 Intra
        </a>

        <p className="club-info">
          🏫 Based at 1337 MED<br/>
          Members authenticate with their 42 Intra account
        </p>
      </div>
    </div>
  );
}
