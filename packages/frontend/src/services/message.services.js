import { getAuthHeaders, BASE_URL } from '../helpers/service.helpers';
import { ApiError } from '../helpers/error.helpers';

export const createMessage = async (createMessageParams, auth) => {
  try {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(auth),
      body: JSON.stringify(createMessageParams),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error?.code || `HTTP_${response.status}`;
      const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
      throw new ApiError(errorCode, errorMessage);
    }

    return data.data;
  } catch (error) {
    console.error('Error creating message:', error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError('NETWORK_ERROR', error.message);
    }
  }
};

export const deleteMessage = async (id, auth) => {
  try {
    const response = await fetch(`${BASE_URL}/messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(auth),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error?.code || `HTTP_${response.status}`;
      const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
      throw new ApiError(errorCode, errorMessage);
    }

    return data.data;
  } catch (error) {
    console.error(`Error deleting message with id ${id}:`, error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError('NETWORK_ERROR', error.message);
    }
  }
};

export const getMessages = async (ticketId, auth) => {
  try {
    const response = await fetch(`${BASE_URL}/messages/${encodeURIComponent(ticketId)}`, {
      method: 'GET',
      headers: getAuthHeaders(auth),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error?.code || `HTTP_${response.status}`;
      const errorMessage = data.error?.message || `HTTP error! Status: ${response.status}`;
      throw new ApiError(errorCode, errorMessage);
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching messages with ticketId ${ticketId}:`, error);
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError('NETWORK_ERROR', error.message);
    }
  }
};
