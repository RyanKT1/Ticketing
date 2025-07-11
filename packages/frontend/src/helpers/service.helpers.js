// Load the configuration file synchronously
export const loadConfig = () => {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/config.json', false);
    xhr.send(null);

    if (xhr.status === 200) {
      const config = JSON.parse(xhr.responseText);
      window.appConfig = { ...window.appConfig, ...config };

      console.log('Configuration loaded');
    } else {
      console.error(`Failed to load configuration`);
    }
  } catch {
    console.error('Error loading configuration:');
  }

  return window.appConfig;
};

loadConfig();

export const getAuthHeaders = auth => {
  return {
    Authorization: `Bearer ${auth?.user?.id_token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
};

export const BASE_URL = window.appConfig.apiEndpoint;
