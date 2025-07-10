
// Beta default values
window.appConfig = window.appConfig || {
  apiEndpoint: 'https://wgwbl1gq7b.execute-api.eu-west-2.amazonaws.com/beta',
  cloudFrontUrl: 'https://d33i8dmm7nziay.cloudfront.net/',
  auth: {
    region: 'eu-west-2',
    userPoolId: 'eu-west-2_mCkMgiuT8',
    userPoolClientId: '4ljm4p4e4il0me3ocuas5d9r3n',
    userPoolDomain: 'https://beta-ticketing-app-user-pool-domain.auth.eu-west-2.amazoncognito.com'
  }
};

// Load the configuration file synchronously
export const loadConfig = () => {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/config.json', false); 
    xhr.send(null);
    
    if (xhr.status === 200) {
      const config = JSON.parse(xhr.responseText);
      window.appConfig = { ...window.appConfig, ...config };
      
      console.log('Configuration loaded:', window.appConfig);
    } else {
      console.error(`Failed to load configuration: ${xhr.status} ${xhr.statusText}`);
    }
  } catch (error) {
    console.error('Error loading configuration:', error);
  }
  
  return window.appConfig;
};

loadConfig();

export const getAuthHeaders = (auth) => {
    return {
        'Authorization': `Bearer ${auth.user?.access_token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
};

export const BASE_URL = window.appConfig.apiEndpoint;
