// Add these after cdk deployment
export const authConfig = {
  authority: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_mCkMgiuT8",
  client_id: "4ljm4p4e4il0me3ocuas5d9r3n",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "email openid profile",
  automaticSilentRenew: true,
  loadUserInfo: true
};


export const getCognitoDomain = () => {

  return "https://beta-ticketing-app-user-pool-domain.auth.eu-west-2.amazoncognito.com";
};
