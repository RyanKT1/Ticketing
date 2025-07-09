
export const authConfig = () => {
  const config = window.appConfig 
  
  return {
    authority: `https://cognito-idp.${config.auth.region}.amazonaws.com/${config.auth.userPoolId}`,
    client_id: config.auth.userPoolClientId,
    redirect_uri: window.location.origin,
    response_type: "code",
    scope: "email openid profile",
    automaticSilentRenew: true,
    loadUserInfo: true,
    post_logout_redirect_uri: window.location.origin,
    monitorSession: true,
    extraQueryParams: {
      prompt: 'login'
    }
  };
};

export const getCognitoDomain = () => {
  const config = window.appConfig
  return config.auth.userPoolDomain;
};
