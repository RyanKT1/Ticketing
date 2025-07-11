export const isUserAdmin = auth => {
  return auth?.user?.profile?.['cognito:groups']?.includes('Admins') || false;
};

export const handleSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

export const handleSignOutRedirect = async auth => {
  await auth.removeUser();
  window.location.href = `${window.appConfig.auth.userPoolDomain}/logout?client_id=${window.appConfig.auth.userPoolClientId}&response_type=code&redirect_uri=${encodeURIComponent(window.appConfig.cloudFrontUrl)}`;
};
