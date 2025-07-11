import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    describe('when no roles are required', () => {
      it('should return true', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: ['Users'] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(undefined);

        const result = guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
          mockContext.getHandler(),
          mockContext.getClass(),
        ]);
        expect(result).toBe(true);
      });
    });

    describe('when user has required role', () => {
      it('should return true', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: ['Admins'] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('when user has one of multiple required roles', () => {
      it('should return true', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: ['Users'] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins', 'Users']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('when user does not have required role', () => {
      it('should return false', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: ['Users'] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });

    describe('when user object is missing', () => {
      it('should return false for admin-only endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({}),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should return true for non-admin endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({}),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Users', 'Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('when user groups are missing', () => {
      it('should return false for admin-only endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: {},
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should return true for non-admin endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: {},
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Users', 'Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('when user has empty groups array', () => {
      it('should return false for admin-only endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: [] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should return true for non-admin endpoints', () => {
        const mockContext = {
          switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
              user: { groups: [] },
            }),
          }),
          getHandler: jest.fn(),
          getClass: jest.fn(),
        } as unknown as ExecutionContext;

        jest.mocked(reflector.getAllAndOverride).mockReturnValue(['Users', 'Admins']);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });
  });
});
