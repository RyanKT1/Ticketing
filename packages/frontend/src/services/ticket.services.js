import { getAuthHeaders, BASE_URL } from '../helpers/service.helpers';
import { ApiError } from '../helpers/error.helpers';

export const getTickets = async (auth) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets`, {
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
        console.error('Error fetching tickets:', error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const createTicket = async (createTicketParams, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets`, {
            method: 'POST',
            headers: getAuthHeaders(auth),
            body: JSON.stringify(createTicketParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error('Error creating ticket:', error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const deleteTicket = async (id, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/${encodeURIComponent(id)}`, {
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
        console.error(`Error deleting ticket with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const getTicket = async (id, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/${encodeURIComponent(id)}`, {
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
        console.error(`Error fetching ticket with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}

export const updateTicket = async (id, updateTicketParams, auth) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: getAuthHeaders(auth),
            body: JSON.stringify(updateTicketParams)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            const errorCode = data.error?.code || `HTTP_${response.status}`;
            const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
            throw new ApiError(errorCode, errorMessage);
        }
        
        return data.data;
    } catch (error) {
        console.error(`Error updating ticket with id ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError('NETWORK_ERROR', error.message);
        }
    }
}
