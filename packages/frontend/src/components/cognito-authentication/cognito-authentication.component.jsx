import { useAuth } from 'react-oidc-context';
import { handleSignOutRedirect } from '../../helpers/auth.helpers';

function CognitoAuthentication({ children }) {
  const auth = useAuth();
  const signOutRedirect = () => handleSignOutRedirect(auth);

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
    console.error('Authentication error:', auth.error);
    return (
      <div className="alert alert-danger m-3">
        <h4>Authentication Error</h4>
        <p>{auth.error.message}</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    if (auth.activeNavigator === 'signinRedirect') {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Redirecting to login...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <h1 className="mb-4">Device Ticketing</h1>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            console.log('Initiating sign-in redirect');
            auth.signinRedirect();
          }}
        >
          Sign in
        </button>
      </div>
    );
  }

  return children({ signOutRedirect });
}

export default CognitoAuthentication;
