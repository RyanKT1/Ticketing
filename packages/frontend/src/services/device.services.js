import { getAuthHeaders, BASE_URL } from '../helpers/service.helpers';
import { ApiError } from '../helpers/error.helpers';

export const getDevices = async (auth) => {
    try {
        const response = await fetch(`${BASE_URL}/devices`, {
            method: 'GET',
            headers: getAuthHeaders(auth)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const createDevice = async (createDeviceParams, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/devices`, {
            method: 'POST',
            headers: getAuthHeaders(auth),
            body: JSON.stringify(createDeviceParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error('Error creating device:', error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const deleteDevice = async (id, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/devices/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(auth)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error(`Error deleting device with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const getDevice = async (id, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/devices/${encodeURIComponent(id)}`, {
            method: "GET",
            headers: getAuthHeaders(auth)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error(`Error fetching device with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const updateDevice = async (id, updateDeviceParams, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/devices/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: getAuthHeaders(auth),
            body: JSON.stringify(updateDeviceParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error(`Error updating device with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}
