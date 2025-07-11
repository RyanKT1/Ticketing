import { getDevices, createDevice, deleteDevice, getDevice, updateDevice } from './device.services';
import { ApiError } from '../helpers/error.helpers';

global.fetch = jest.fn();

describe('Device Services', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('getDevices', () => {
    describe('when API call is successful', () => {
      it('should return the device data', async () => {
        const mockDevices = [
          { id: '1', name: 'Device 1', model: 'Model A', manufacturer: 'Manufacturer X' },
          { id: '2', name: 'Device 2', model: 'Model B', manufacturer: 'Manufacturer Y' },
        ];

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: mockDevices }),
          headers: new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getDevices(mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/devices'),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              Accept: 'application/json',
              'Content-Type': 'application/json',
            }),
          })
        );

        expect(result).toEqual(mockDevices);
      });
    });

    describe('when API returns an error', () => {
      it('should throw an ApiError with the error details', async () => {
        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Devices not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getDevices(mockAuth)).rejects.toThrow(ApiError);
        await expect(getDevices(mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Devices not found',
        });
      });
    });

    describe('when network error occurs', () => {
      it('should throw a NETWORK_ERROR ApiError', async () => {
        fetch.mockRejectedValue(new Error('Network failure'));

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getDevices(mockAuth)).rejects.toThrow(ApiError);
        await expect(getDevices(mockAuth)).rejects.toMatchObject({
          name: 'NETWORK_ERROR',
          message: 'Network failure',
        });
      });
    });
  });

  describe('createDevice', () => {
    describe('when device data is valid', () => {
      it('should return the created device', async () => {
        const deviceData = {
          name: 'New Device',
          model: 'Model X',
          manufacturer: 'Manufacturer Z',
        };

        const createdDevice = {
          id: '3',
          ...deviceData,
          createdAt: '2025-07-11T10:00:00Z',
          updatedAt: '2025-07-11T10:00:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: createdDevice }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await createDevice(deviceData, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/devices'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(deviceData),
          })
        );

        expect(result).toEqual(createdDevice);
      });
    });

    describe('when API returns an error', () => {
      it('should throw an ApiError with the error details', async () => {
        const deviceData = {
          name: 'Invalid Device',
        };

        const errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid device data',
          },
        };

        const mockResponse = {
          ok: false,
          status: 400,
          json: jest.fn().mockResolvedValue(errorResponse),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(createDevice(deviceData, mockAuth)).rejects.toThrow(ApiError);
        await expect(createDevice(deviceData, mockAuth)).rejects.toMatchObject({
          name: 'VALIDATION_ERROR',
          message: 'Invalid device data',
        });
      });
    });
  });

  describe('deleteDevice', () => {
    describe('when device exists', () => {
      it('should return the deleted device data', async () => {
        const deviceId = '1';
        const deletedDevice = { id: deviceId };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: deletedDevice }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await deleteDevice(deviceId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/devices/${deviceId}`),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );

        expect(result).toEqual(deletedDevice);
      });
    });

    describe('when device does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const deviceId = 'non-existent';

        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Device not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };
        await expect(deleteDevice(deviceId, mockAuth)).rejects.toThrow(ApiError);
        await expect(deleteDevice(deviceId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Device not found',
        });
      });
    });
  });

  describe('getDevice', () => {
    describe('when device exists', () => {
      it('should return the device data', async () => {
        const deviceId = '1';
        const device = {
          id: deviceId,
          name: 'Device 1',
          model: 'Model A',
          manufacturer: 'Manufacturer X',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: device }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await getDevice(deviceId, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/devices/${deviceId}`),
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );

        expect(result).toEqual(device);
      });
    });

    describe('when device does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const deviceId = 'non-existent';

        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Device not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(getDevice(deviceId, mockAuth)).rejects.toThrow(ApiError);
        await expect(getDevice(deviceId, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Device not found',
        });
      });
    });
  });

  describe('updateDevice', () => {
    describe('when device exists and data is valid', () => {
      it('should return the updated device', async () => {
        const deviceId = '1';
        const updateData = {
          name: 'Updated Device',
          model: 'Updated Model',
        };

        const updatedDevice = {
          id: deviceId,
          name: 'Updated Device',
          model: 'Updated Model',
          manufacturer: 'Manufacturer X',
          updatedAt: '2025-07-11T10:30:00Z',
        };

        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({ data: updatedDevice }),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        const result = await updateDevice(deviceId, updateData, mockAuth);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(`/devices/${deviceId}`),
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify(updateData),
          })
        );

        expect(result).toEqual(updatedDevice);
      });
    });

    describe('when device does not exist', () => {
      it('should throw a NOT_FOUND ApiError', async () => {
        const deviceId = 'non-existent';
        const updateData = { name: 'Updated Device' };

        const errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Device not found',
          },
        };

        const mockResponse = {
          ok: false,
          status: 404,
          json: jest.fn().mockResolvedValue(errorResponse),
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(updateDevice(deviceId, updateData, mockAuth)).rejects.toThrow(ApiError);
        await expect(updateDevice(deviceId, updateData, mockAuth)).rejects.toMatchObject({
          name: 'NOT_FOUND',
          message: 'Device not found',
        });
      });
    });

    describe('when update data is invalid', () => {
      it('should throw a VALIDATION_ERROR ApiError', async () => {
        const deviceId = '1';
        const updateData = { name: '' };

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
        };

        fetch.mockResolvedValue(mockResponse);

        const mockAuth = { user: { id_token: 'test-token' } };

        await expect(updateDevice(deviceId, updateData, mockAuth)).rejects.toThrow(ApiError);
        await expect(updateDevice(deviceId, updateData, mockAuth)).rejects.toMatchObject({
          name: 'VALIDATION_ERROR',
          message: 'Invalid update data',
        });
      });
    });
  });
});
