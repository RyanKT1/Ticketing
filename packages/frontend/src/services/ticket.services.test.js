import { getTickets, createTicket, deleteTicket, getTicket, updateTicket } from './ticket.services';
import { ApiError } from '../helpers/error.helpers';

global.fetch = jest.fn();

describe('Ticket Services', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getTickets', () => {
    describe('when API call is successful', () => {
      it('should return the ticket data', async () => {
        const mockTickets = [
          {
            id: '1',
            title: 'Ticket 1',
            description: 'Description 1',
            ticketOwner: 'user1',
            deviceId: 'device1',
            severity: 1,
            resolved: false,
            createdAt: '2025-07-10T10:00:00Z',
            updatedAt: '2025-07-10T10:00:00Z',
          },
          {
            id: '2',
            title: 'Ticket 2',
            description: 'Description 2',
            ticketOwner: 'user2',
            deviceId: 'device2',
            severity: 2,
            resolved: true,
            createdAt: '2025-07-11T10:00:00Z',
            updatedAt: '2025-07-11T10:00:00Z',
          },
        ];

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockTickets }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getTickets(mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/tickets'),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(mockTickets);
      });
    });

    describe('when API returns an error', () => {
      it('should throw an ApiError with the error details', async () => {
        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Tickets not found',
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

        await expect(getTickets(mockAuth)).rejects.toThrow(ApiError);
        await expect(getTickets(mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Tickets not found',
        });
      });
    });

    describe('when network error occurs', () => {
      it('should throw a NETWORK_ERROR ApiError', async () => {
        fetch.mockRejectedValue(new Error('Network failure'));

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getTickets(mockAuth)).rejects.toThrow(ApiError);
        await expect(getTickets(mockAuth)).rejects.toMatchObject({
          name: 'NETWORK_ERROR',
          message: 'Network failure',
        });
      });
    });
  });

  describe('createTicket', () => {
    describe('when ticket data is valid', () => {
      it('should return the created ticket', async () => {
        const ticketData = {
          title: 'New Ticket',
          description: 'New Description',
          deviceId: 'device1',
          severity: 3,
        };

        const createdTicket = {
          id: '3',
          ...ticketData,
          ticketOwner: 'user1',
          resolved: false,
          createdAt: '2025-07-11T10:00:00Z',
          updatedAt: '2025-07-11T10:00:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: createdTicket }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await createTicket(ticketData, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/tickets'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(ticketData),
          })
        );

        expect(result).toEqual(createdTicket);
      });
    });

    describe('when API returns an error', () => {
      it('should throw an ApiError with the error details', async () => {
        const ticketData = {
          title: 'Invalid Ticket',
        };

        const errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ticket data',
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

        await expect(createTicket(ticketData, mockAuth)).rejects.toThrow(ApiError);
        await expect(createTicket(ticketData, mockAuth)).rejects.toMatchObject({
          name: 'VALIDATION_ERROR',
          message: 'Invalid ticket data',
        });
      });
    });
  });

  describe('deleteTicket', () => {
    describe('when ticket exists', () => {
      it('should return the deleted ticket data', async () => {
        const ticketId = '1';
        const deletedTicket = { id: ticketId };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: deletedTicket }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await deleteTicket(ticketId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/tickets/${ticketId}`),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(deletedTicket);
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

        await expect(deleteTicket(ticketId, mockAuth)).rejects.toThrow(ApiError);
        await expect(deleteTicket(ticketId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      });
    });
  });

  describe('getTicket', () => {
    describe('when ticket exists', () => {
      it('should return the ticket data', async () => {
        const ticketId = '1';
        const ticket = {
          id: ticketId,
          title: 'Ticket 1',
          description: 'Description 1',
          ticketOwner: 'user1',
          deviceId: 'device1',
          severity: 1,
          resolved: false,
          createdAt: '2025-07-10T10:00:00Z',
          updatedAt: '2025-07-10T10:00:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: ticket }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getTicket(ticketId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/tickets/${ticketId}`),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(ticket);
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

        await expect(getTicket(ticketId, mockAuth)).rejects.toThrow(ApiError);
        await expect(getTicket(ticketId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      });
    });
  });

  describe('updateTicket', () => {
    describe('when ticket exists and data is valid', () => {
      it('should return the updated ticket', async () => {
        const ticketId = '1';
        const updateData = {
          title: 'Updated Ticket',
          resolved: true,
        };

        const updatedTicket = {
          id: ticketId,
          title: 'Updated Ticket',
          description: 'Description 1',
          ticketOwner: 'user1',
          deviceId: 'device1',
          severity: 1,
          resolved: true,
          createdAt: '2025-07-10T10:00:00Z',
          updatedAt: '2025-07-11T10:30:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: updatedTicket }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await updateTicket(ticketId, updateData, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/tickets/${ticketId}`),
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(updateData),
          })
        );

        expect(result).toEqual(updatedTicket);
      });
    });

    describe('when ticket does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const ticketId = 'non-existent';
        const updateData = { title: 'Updated Ticket' };

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

        await expect(updateTicket(ticketId, updateData, mockAuth)).rejects.toThrow(ApiError);
        await expect(updateTicket(ticketId, updateData, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      });
    });

    describe('when update data is invalid', () => {
      it('should throw a VALIDATION_ERROR ApiError', async () => {
        const ticketId = '1';
        const updateData = { severity: 'invalid' };

        const errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid update data',
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

        await expect(updateTicket(ticketId, updateData, mockAuth)).rejects.toThrow(ApiError);
        await expect(updateTicket(ticketId, updateData, mockAuth)).rejects.toMatchObject({
          name: 'VALIDATION_ERROR',
          message: 'Invalid update data',
        });
      });
    });
  });
});
