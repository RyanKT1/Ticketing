import { getCognitoDomain } from '../config/auth-config';


export const handleSigninCallback = () => {
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );
};

export const handleSignOutRedirect = (auth) => {
  const clientId = auth.settings.client_id;
  const logoutUri = getCloudfrontDomain()
  const cognitoDomain = getCognitoDomain();
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  console.log(window.location.href)
};
