import { createMessage, deleteMessage, getMessages } from './message.services';
import { ApiError } from '../helpers/error.helpers';

global.fetch = jest.fn();

describe('Message Services', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('createMessage', () => {
    describe('when message data is valid', () => {
      it('should return the created message', async () => {
        const messageData = {
          ticketId: '1',
          content: 'Test message content',
        };

        const createdMessage = {
          id: '1',
          ...messageData,
          author: 'user1',
          createdAt: '2025-07-11T10:00:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: createdMessage }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await createMessage(messageData, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/messages'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(messageData),
          })
        );

        expect(result).toEqual(createdMessage);
      });
    });

    describe('when API returns an error', () => {
      it('should throw an ApiError with the error details', async () => {
        const messageData = {
          content: 'Invalid message',
        };

        const errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message data',
          },
        };

        const mockResponse = {
          ok: false,
          status: 400,
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(createMessage(messageData, mockAuth)).rejects.toThrow(ApiError);
        await expect(createMessage(messageData, mockAuth)).rejects.toMatchObject({
          name: 'VALIDATION_ERROR',
          message: 'Invalid message data',
        });
      });
    });

    describe('when network error occurs', () => {
      it('should throw a NETWORK_ERROR ApiError', async () => {
        const messageData = {
          ticketId: '1',
          content: 'Test message content',
        };

        fetch.mockRejectedValue(new Error('Network failure'));

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(createMessage(messageData, mockAuth)).rejects.toThrow(ApiError);
        await expect(createMessage(messageData, mockAuth)).rejects.toMatchObject({
          name: 'NETWORK_ERROR',
          message: 'Network failure',
        });
      });
    });
  });

  describe('deleteMessage', () => {
    describe('when message exists', () => {
      it('should return the deleted message data', async () => {
        const messageId = '1';
        const deletedMessage = { id: messageId };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: deletedMessage }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await deleteMessage(messageId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/messages/${messageId}`),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(deletedMessage);
      });
    });

    describe('when message does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const messageId = 'non-existent';

        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Message not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(deleteMessage(messageId, mockAuth)).rejects.toThrow(ApiError);
        await expect(deleteMessage(messageId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Message not found',
        });
      });
    });

    describe('when user is not authorized', () => {
      it('should throw an UNAUTHORIZED ApiError', async () => {
        const messageId = '1';

        const errorResponse = {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authorized to delete this message',
          },
        };

        const mockResponse = {
          ok: false,
          status: 403,
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(deleteMessage(messageId, mockAuth)).rejects.toThrow(ApiError);
        await expect(deleteMessage(messageId, mockAuth)).rejects.toMatchObject({
          name: 'UNAUTHORIZED',
          message: 'Not authorized to delete this message',
        });
      });
    });
  });

  describe('getMessages', () => {
    describe('when ticket exists and has messages', () => {
      it('should return the messages for the ticket', async () => {
        const ticketId = '1';
        const mockMessages = [
          {
            id: '1',
            ticketId: ticketId,
            content: 'First message',
            author: 'user1',
            createdAt: '2025-07-10T10:00:00Z',
          },
          {
            id: '2',
            ticketId: ticketId,
            content: 'Second message',
            author: 'user2',
            createdAt: '2025-07-10T11:00:00Z',
          },
        ];

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockMessages }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getMessages(ticketId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/messages/${ticketId}`),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(mockMessages);
      });
    });

    describe('when ticket exists but has no messages', () => {
      it('should return an empty array', async () => {
        const ticketId = '1';
        const mockMessages = [];

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockMessages }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getMessages(ticketId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/messages/${ticketId}`),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );

        expect(result).toEqual(mockMessages);
        expect(result.length).toBe(0);
      });
    });

    describe('when ticket does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const ticketId = 'non-existent';

        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Ticket not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getMessages(ticketId, mockAuth)).rejects.toThrow(ApiError);
        await expect(getMessages(ticketId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      });
    });

    describe('when network error occurs', () => {
      it('should throw a NETWORK_ERROR ApiError', async () => {
        const ticketId = '1';

        fetch.mockRejectedValue(new Error('Network failure'));

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getMessages(ticketId, mockAuth)).rejects.toThrow(ApiError);
        await expect(getMessages(ticketId, mockAuth)).rejects.toMatchObject({
          name: 'NETWORK_ERROR',
          message: 'Network failure',
        });
      });
    });
  });
});
