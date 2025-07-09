import { useAuth } from 'react-oidc-context';
import { getAuthHeaders,BASE_URL } from '../helpers/service.helpers';


export const getDevices = async () => {
  const auth = useAuth();

    try {
        const response = await fetch(`${BASE_URL}/devices`, {
            method: 'GET',
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        // error modal
        return [];
    }
}

export const createDevice = async (createDeviceParams) => {
  const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/devices/create`, {
            method: 'POST',
            headers: getAuthHeaders(auth),
            body: JSON.stringify(createDeviceParams)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating device:', error);
        // error modal
        throw error;
    }
}

export const deleteDevice = async (id) => {
  const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/devices/id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error deleting device with id ${id}:`, error);
        // error modal
        throw error;
    }
}

export const getDevice = async (id) => {
  const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/devices/id=${encodeURIComponent(id)}`, {
            method: "GET",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error fetching device with id ${id}:`, error);
        // error modal
        return null;
    }
}

export const updateDevice = async (id, updateDeviceParams) => {
  const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/devices/id=${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: getAuthHeaders(auth),
            body: JSON.stringify(updateDeviceParams)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error updating device with id ${id}:`, error);
        // error modal
        throw error;
    }
}
