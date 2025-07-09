import { useAuth } from 'react-oidc-context';
import { getAuthHeaders, BASE_URL } from '../helpers/service.helpers';

export const createMessage = async (createMessageParams, file = null) => {
    const auth = useAuth();
    try {
        let response;
        
        if (file) {
            const formData = new FormData();

            Object.keys(createMessageParams).forEach(key => {
                formData.append(key, createMessageParams[key]);
            });
            
            formData.append('file', file);
            
            response = await fetch(`${BASE_URL}/messages`, {
                headers:{ 'Authorization': `Bearer ${auth.user?.access_token}`},
                method: 'POST',
                body: formData
            });
        } else {
            response = await fetch(`${BASE_URL}/messages`, {
                method: 'POST',
                headers: getAuthHeaders(auth),
                body: JSON.stringify(createMessageParams)
            });
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating message:', error);
        // error modal
        throw error;
    }
}

export const deleteMessage = async (id) => {
    const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/messages/id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error deleting message with id ${id}:`, error);
        // error modal
        throw error;
    }
}

export const getMessages = async (tickedId) => {
    const auth = useAuth();
    try {
        const response = await fetch(`${BASE_URL}/messages/ticketId=${encodeURIComponent(tickedId)}`, {
            method: "GET",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error fetching messages with ticketId ${tickedId}:`, error);
        // error modal
        return null;
    }
}
