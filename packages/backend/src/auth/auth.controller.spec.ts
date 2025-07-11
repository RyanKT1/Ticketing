import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RequestContextProvider } from './providers/request-context.provider';
import { ApiGatewayAuthGuard } from './guards/api-gateway-auth.guard';
import { RolesGuard } from './guards/roles.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRequestContextProvider: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRequestContextProvider = {
      getAuthorizer: jest.fn().mockReturnValue({
        claims: {
          sub: 'test-user-id',
          'cognito:username': 'test-user',
          email: 'test@example.com',
          'cognito:groups': ['Users', 'Admins'],
        },
      }),
      getIdentity: jest.fn(),
      setEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RequestContextProvider,
          useValue: mockRequestContextProvider,
        },
        {
          provide: ApiGatewayAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    describe('when user is authenticated', () => {
      it('should return user profile information', () => {
        const mockRequest = {
          user: {
            userId: 'user-123',
            username: 'testuser',
            email: 'test@example.com',
            groups: ['Users'],
          },
        };

        const result = controller.getProfile(mockRequest);

        expect(result).toEqual({
          userId: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          groups: ['Users'],
        });
      });
    });

    describe('when user has no groups', () => {
      it('should return user profile with empty groups array', () => {
        const mockRequest = {
          user: {
            userId: 'user-123',
            username: 'testuser',
            email: 'test@example.com',
            groups: [],
          },
        };

        const result = controller.getProfile(mockRequest);

        expect(result).toEqual({
          userId: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          groups: [],
        });
      });
    });
  });

  describe('adminOnly', () => {
    describe('when user is an admin', () => {
      it('should return admin-only message with user information', () => {
        const mockRequest = {
          user: {
            userId: 'admin-123',
            username: 'adminuser',
            email: 'admin@example.com',
            groups: ['Admins'],
          },
        };

        const result = controller.adminOnly(mockRequest);

        expect(result).toEqual({
          message: 'This is an admin-only endpoint',
          user: mockRequest.user,
        });
      });
    });
  });

  describe('userOnly', () => {
    describe('when user is a regular user', () => {
      it('should return user-only message with user information', () => {
        const mockRequest = {
          user: {
            userId: 'user-123',
            username: 'testuser',
            email: 'test@example.com',
            groups: [],
          },
        };

        const result = controller.userOnly(mockRequest);

        expect(result).toEqual({
          message: 'This is a user-only endpoint',
          user: mockRequest.user,
        });
      });
    });

    describe('when user is an admin', () => {
      it('should return user-only message with user information', () => {
        const mockRequest = {
          user: {
            userId: 'admin-123',
            username: 'adminuser',
            email: 'admin@example.com',
            groups: ['Admins'],
          },
        };

        const result = controller.userOnly(mockRequest);

        expect(result).toEqual({
          message: 'This is a user-only endpoint',
          user: mockRequest.user,
        });
      });
    });
  });
});
