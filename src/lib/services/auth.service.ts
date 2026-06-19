import { apiMilenium } from '$lib/config';
import type { AuthTokens, CurrentUser, CurrentUserResponse, LoginCredentials, LoginResponse, User } from '$lib/interfaces';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from '$lib/constants';
import { redirect } from '$lib/utils';

class AuthService {
  public static getTokens(): AuthTokens | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.warn('Error accessing localStorage for tokens:', error);
      return null;
    }
  }

  public static setTokens(tokens: AuthTokens): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.warn('Error saving tokens to localStorage:', error);
    }
  }

  getCurrentUser(): CurrentUser | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Error accessing localStorage for user data:', error);
      return null;
    }
  }

  setCurrentUser(user: CurrentUser): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Error saving user data to localStorage:', error);
    }
  }

  public static clearAuth(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.warn('Error clearing auth data:', error);
    }
  }

  public static isAuthenticated(): boolean {
    return !!this.getTokens()?.accessToken;
  }


  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiMilenium.postPublic<LoginResponse>('/auth/login', credentials);

      if (response.status === 'success') {
        AuthService.setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });

        // Fetch full user info immediately after login
        await this.getMe();
      }

      return response;
    } catch (error) {
      AuthService.clearAuth();
      throw error;
    }
  }

  async getMe(): Promise<CurrentUser> {
    try {
      const mockData: CurrentUser = {
        id: "bc693671-f1a3-43bb-8aa1-f77a17c68463",
        rol_id: "45a466b5-11d6-4984-9d86-3523f5111276",
        id_sucursal: "1",
        name_user: "yolanda123",
        email: "sadm@lubricantesYolanda.com",
        esta_activo: true,
        createdAt: "2026-06-19T19:06:15.558Z",
        updatedAt: "2026-06-19T19:06:15.558Z",
        Empleado: {
          id: "823a55f2-a762-4d87-9bc0-c445a58a8386",
          usuario_id: "bc693671-f1a3-43bb-8aa1-f77a17c68463",
          ci: "12345678",
          fecha_despido: null,
          nombre: "Yolanda",
          apellido_paterno: "Lubricantes",
          apellido_materno: "Lubri",
          cargo: null,
          fecha_nacimiento: "2026-06-19T19:06:15.558Z",
          fecha_contratacion: "2026-06-19T19:06:15.558Z",
          salario_base: null,
          telefono: null,
          direccion: null,
          esta_activo: true,
          createdAt: "2026-06-19T19:06:15.558Z",
          updatedAt: "2026-06-19T19:06:15.558Z"
        },
        Role: {
          id: "45a466b5-11d6-4984-9d86-3523f5111276",
          code_rol: "SADM",
          nombre_rol: "Super_Admin",
          descripcion: "Administrador del sistema",
          createdAt: "2026-06-19T19:06:14.113Z",
          updatedAt: "2026-06-19T19:06:14.113Z"
        }
      };

      this.setCurrentUser(mockData);
      return mockData;

      /*
      const response = await apiMilenium.get<CurrentUserResponse>('/auth/me');
      console.log(response);
      if (response.status === 'success') {
        this.setCurrentUser(response.data);
        return response.data;
      }
      throw new Error('Failed to fetch user data');
      */
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await apiMilenium.postPublic('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiMilenium.postPublic(`/auth/reset-password/${token}`, { password });
  }

  async logout(): Promise<void> {
    try {
    } catch (error) {
      console.warn('Error during logout request:', error);
    } finally {
      AuthService.clearAuth();
      redirect('/auth/sign-in');
    }
  }
  getToken(): string | null {
    return AuthService.getTokens()?.accessToken || null;
  }

  getRefreshToken(): string | null {
    return AuthService.getTokens()?.refreshToken || null;
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      AuthService.clearAuth();
      throw new Error('No refresh token available');
    }

    try {
      // Usamos postPublic para evitar headers de auth y recursión infinita
      const response = await apiMilenium.postPublic<{ status: string; accessToken: string }>(
        '/auth/refresh-token',
        { refreshToken }
      );

      if (response.status === 'success') {
        const currentTokens = AuthService.getTokens();
        if (currentTokens) {
          AuthService.setTokens({
            accessToken: response.accessToken,
            refreshToken: currentTokens.refreshToken
          });
        }
        return response.accessToken;
      }
      throw new Error('Refresh token failed');
    } catch (error) {
      AuthService.clearAuth();
      throw error;
    }
  }

  clearToken(): void {
    AuthService.clearAuth();
  }

}

export const authService = new AuthService();
