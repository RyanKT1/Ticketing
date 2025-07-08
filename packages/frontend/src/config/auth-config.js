// Add these after cdk deployment
export const authConfig = {
  authority: "",
  client_id: "",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "email openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true
};


export const getCognitoDomain = () => {

  return "";
};
