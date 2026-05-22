import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const { user, loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, fullName);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      
      <div className="auth-card glass-strong anim-fade-up">
        <div className="auth-header">
          <img src="/logo.png" alt="Opporix" className="auth-logo" style={{ objectFit: 'contain' }} />
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to track your government opportunities.' : 'Join Opporix to find perfect opportunity.'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-google-btn" onClick={loginWithGoogle}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} />
          Continue with Google
        </button>

        <div className="auth-divider">or continue with email</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="auth-input" 
                placeholder="John Doe" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="auth-input" 
              placeholder="you@example.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button className="auth-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
