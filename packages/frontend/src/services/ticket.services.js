import { getAuthHeaders, BASE_URL } from '../helpers/service.helpers';

export const getTickets = async (auth) => {
   

    try {
        const response = await fetch(`${BASE_URL}/tickets`, {
            method: 'GET',
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        // error modal
        return [];
    }
}

export const createTicket = async (createTicketParams,auth) => {
   

    try {
        const response = await fetch(`${BASE_URL}/tickets/create`, {
            method: 'POST',
            headers: getAuthHeaders(auth),
            body: JSON.stringify(createTicketParams)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error creating ticket:', error);
        // error modal
        throw error;
    }
}

export const deleteTicket = async (id,auth) => {
   

    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error deleting ticket with id ${id}:`, error);
        // error modal
        throw error;
    }
}

export const getTicket = async (id,auth) => {
   

    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "GET",
            headers: getAuthHeaders(auth)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error fetching ticket with id ${id}:`, error);
        // error modal
        return null;
    }
}

export const updateTicket = async (id, updateTicketParams,auth) => {
   

    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: getAuthHeaders(auth),
            body: JSON.stringify(updateTicketParams)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(`Error updating ticket with id ${id}:`, error);
        // error modal
        throw error;
    }
}
