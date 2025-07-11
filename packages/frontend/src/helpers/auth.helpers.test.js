import { isUserAdmin, handleSigninCallback, handleSignOutRedirect } from './auth.helpers';

describe('Auth Helpers', () => {
  describe('isUserAdmin', () => {
    describe('when user has Admin group', () => {
      it('should return true', () => {
        const mockAuth = {
          user: {
            profile: {
              'cognito:groups': ['Admins', 'Users'],
            },
          },
        };

        const result = isUserAdmin(mockAuth);

        expect(result).toBe(true);
      });
    });

    describe('when user does not have Admin group', () => {
      it('should return false', () => {
        const mockAuth = {
          user: {
            profile: {
              'cognito:groups': ['Users'],
            },
          },
        };

        const result = isUserAdmin(mockAuth);

        expect(result).toBe(false);
      });
    });

    describe('when user has no groups', () => {
      it('should return false', () => {
        const mockAuth = {
          user: {
            profile: {
              'cognito:groups': [],
            },
          },
        };

        const result = isUserAdmin(mockAuth);

        expect(result).toBe(false);
      });
    });

    describe('when user profile is undefined', () => {
      it('should return false', () => {
        const mockAuth = {
          user: {},
        };

        const result = isUserAdmin(mockAuth);

        expect(result).toBe(false);
      });
    });

    describe('when user is undefined', () => {
      it('should return false', () => {
        const mockAuth = {};

        const result = isUserAdmin(mockAuth);

        expect(result).toBe(false);
      });
    });

    describe('when auth is undefined', () => {
      it('should return false', () => {
        const result = isUserAdmin(undefined);

        expect(result).toBe(false);
      });
    });
  });

  describe('handleSigninCallback', () => {
    describe('when called', () => {
      it('should replace the current URL state', () => {
        const originalReplaceState = window.history.replaceState;
        window.history.replaceState = jest.fn();
        document.title = 'Test Title';
        window.location.pathname = '/';

        handleSigninCallback();

        expect(window.history.replaceState).toHaveBeenCalledWith({}, 'Test Title', '/');

        window.history.replaceState = originalReplaceState;
      });
    });
  });

  describe('handleSignOutRedirect', () => {
    describe('when called with valid auth', () => {
      it('should call removeUser method on the auth object', async () => {
        const mockAuth = {
          removeUser: jest.fn().mockResolvedValue(undefined),
        };

        await handleSignOutRedirect(mockAuth);

        expect(mockAuth.removeUser).toHaveBeenCalled();
      });
    });
  });
});
