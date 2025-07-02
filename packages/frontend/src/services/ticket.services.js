const BASE_URL = 'https://3h8nlg6y5l.execute-api.eu-west-2.amazonaws.com'

export const getTickets = async () => {
    try {
        const response = await fetch(`${BASE_URL}/tickets`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        // error modal
        return [];
    }
}

export const createTicket = async (createTicketParams) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/create`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
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

export const deleteTicket = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
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

export const getTicket = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
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

export const updateTicket = async (id, updateTicketParams) => {
    try {
        const response = await fetch(`${BASE_URL}/tickets/id=${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
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
