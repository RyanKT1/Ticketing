import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import { loadConfig } from './helpers/service.helpers'
import { authConfig } from './config/auth-config'
import { handleSigninCallback } from './helpers/auth.helpers'


loadConfig()
const auth = authConfig();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...auth} onSigninCallback={handleSigninCallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)