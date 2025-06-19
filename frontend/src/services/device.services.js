

const BASE_URL = ''
export const getDevices = async () => {
    const response = await fetch(`${BASE_URL}/devices`);
    const data = await response.json();
  return data.results;
}
export const createDevice = async (query) => {
    
    const response = await fetch(
    `${BASE_URL}/search/devices/query=${encodeURIComponent(
      query
    )}`
  );
  const data = await response.json();
  return data.results;
}

export const deleteDevice  = async (id) => {
     const response = await fetch(
    `${BASE_URL}/search/devices/query=${encodeURIComponent(
      id
    )}`
  );
  const data = await response.json();
  return data.results;
}

export const getDevice = async (id) => {
     const response = await fetch(
    `${BASE_URL}/search/devices/query=${encodeURIComponent(
      id
    )}`
  );
  const data = await response.json();
  return data.results;
}

export const updateDevice = async (query) => {
     const response = await fetch(
    `${BASE_URL}/search/devices/query=${encodeURIComponent(
      query
    )}`
  );
  const data = await response.json();
  return data.results;
}