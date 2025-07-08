import { useAuth } from 'react-oidc-context';
import { getCognitoDomain } from '../../config/auth-config';

function CognitoAuthentication({ authenticatedContent }) {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = auth.settings.client_id;
    const logoutUri = window.location.origin;
    const cognitoDomain = getCognitoDomain();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="alert alert-danger m-3">
        <h4>Authentication Error</h4>
        <p>{auth.error.message}</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-4">Device Ticketing</h1>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => auth.signinRedirect()}
        >
          Sign in
        </button>
      </div>
    );
  }
  return authenticatedContent({ signOutRedirect });
}

export default CognitoAuthentication;
