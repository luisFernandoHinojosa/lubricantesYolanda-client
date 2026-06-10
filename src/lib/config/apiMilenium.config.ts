import { ErrorType } from '$lib/interfaces';
import { AppError, authService, errorService } from '$lib/services';
import { API_CONFIG, defaultHeaders } from './api.config';

interface RequestOptions {
	requireAuth?: boolean;
	customHeaders?: HeadersInit;
}

class ApiMilenium {
	// Método para construir headers con autenticación
	private buildHeaders(options: RequestOptions = {}): HeadersInit {
		const headers: HeadersInit = { ...defaultHeaders };

		// Agregar headers customizados si existen
		if (options.customHeaders) {
			Object.assign(headers, options.customHeaders);
		}

		// Agregar token de autorización si es requerido
		if (options.requireAuth !== false) {
			// Por defecto requiere auth
			const token = authService.getToken();
			if (token) {
				(headers as Record<string, string>).Authorization = `Bearer ${token}`;
			} else if (options.requireAuth === true) {
				// Si explícitamente requiere auth y no hay token, lanzar error
				throw new AppError('Token de autenticación requerido', ErrorType.AUTHENTICATION, 401);
			}
		}

		return headers;
	}

	// Método genérico para solicitudes
	private async request<T>(
		endpoint: string,
		method: string,
		data?: unknown,
		options: RequestOptions = {}
	): Promise<T> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

		try {
			const headers = this.buildHeaders(options);
			const isFormData = data instanceof FormData;

			// Si es FormData, dejar que el navegador establezca el Content-Type con el boundary
			if (isFormData) {
				delete (headers as Record<string, string>)['Content-Type'];
			}

			const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
				method,
				headers,
				body: isFormData ? (data as FormData) : data ? JSON.stringify(data) : undefined,
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			// Manejar respuesta 204 (No Content)
			if (response.status === 204) {
				return {} as T;
			}

			// Manejar errores de respuesta
			if (!response.ok) {
				const errorBody = await response.json().catch(() => ({}));
				const errorType = errorService.mapHttpToErrorType(response.status);

				// Si es error 401, limpiar token
				if (response.status === 401) {
					authService.clearToken();
				}

				throw new AppError(
					errorBody.message || 'Error en la solicitud',
					errorType,
					response.status
				);
			}

			return response.json();
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new AppError('Solicitud cancelada por timeout', ErrorType.NETWORK, 408);
			}

			if (error instanceof AppError) {
				throw error; // Re-throw AppError sin modificar
			}

			throw new AppError(
				'Error de red',
				ErrorType.NETWORK,
				undefined,
				error instanceof Error ? error : undefined
			);
		}
	}

	// Métodos para diferentes tipos de solicitudes
	async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'GET', undefined, options);
	}

	async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'POST', data, options);
	}

	async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PUT', data, options);
	}

	async patch<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'PATCH', data, options);
	}

	async delete<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
		return this.request<T>(endpoint, 'DELETE', data, options);
	}

	// Métodos específicos para endpoints que no requieren autenticación
	async getPublic<T>(endpoint: string): Promise<T> {
		return this.get<T>(endpoint, { requireAuth: false });
	}

	async postPublic<T>(endpoint: string, data: unknown): Promise<T> {
		return this.post<T>(endpoint, data, { requireAuth: false });
	}
}

export const apiMilenium = new ApiMilenium();

// import { ErrorType } from '$lib/interfaces';
// import { AppError, authService, errorService } from '$lib/services';
// import { API_CONFIG, defaultHeaders } from './api.config';

// interface RequestOptions {
// 	requireAuth?: boolean;
// 	customHeaders?: HeadersInit;
// }

// class ApiMilenium {
// 	private isRefreshing = false;
// 	private refreshSubscribers: ((token: string) => void)[] = [];

// 	private onRefreshed(token: string) {
// 		this.refreshSubscribers.map((cb) => cb(token));
// 		this.refreshSubscribers = [];
// 	}

// 	private addRefreshSubscriber(cb: (token: string) => void) {
// 		this.refreshSubscribers.push(cb);
// 	}

// 	// Método para construir headers con autenticación
// 	private buildHeaders(options: RequestOptions = {}): HeadersInit {
// 		const headers: HeadersInit = { ...defaultHeaders };

// 		// Agregar headers customizados si existen
// 		if (options.customHeaders) {
// 			Object.assign(headers, options.customHeaders);
// 		}

// 		// Agregar token de autorización si es requerido
// 		if (options.requireAuth !== false) {
// 			// Por defecto requiere auth
// 			const token = authService.getToken();
// 			if (token) {
// 				(headers as Record<string, string>).Authorization = `Bearer ${token}`;
// 			} else if (options.requireAuth === true) {
// 				// Si explícitamente requiere auth y no hay token, lanzar error
// 				throw new AppError('Token de autenticación requerido', ErrorType.AUTHENTICATION, 401);
// 			}
// 		}

// 		return headers;
// 	}

// 	// Método genérico para solicitudes
// 	private async request<T>(
// 		endpoint: string,
// 		method: string,
// 		data?: unknown,
// 		options: RequestOptions = {}
// 	): Promise<T> {
// 		const controller = new AbortController();
// 		const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

// 		try {
// 			const headers = this.buildHeaders(options);

// 			const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
// 				method,
// 				headers,
// 				body: data ? JSON.stringify(data) : undefined,
// 				signal: controller.signal
// 			});

// 			clearTimeout(timeoutId);

// 			// Manejar respuesta 204 (No Content)
// 			if (response.status === 204) {
// 				return {} as T;
// 			}

// 			// Manejar errores de respuesta
// 			if (!response.ok) {
// 				const errorBody = await response.json().catch(() => ({}));

// 				// Si es error 401 y requiere auth, intentar refrescar el token
// 				if (response.status === 401 && options.requireAuth !== false) {
// 					if (!this.isRefreshing) {
// 						this.isRefreshing = true;
// 						try {
// 							const newToken = await authService.refreshToken();
// 							this.onRefreshed(newToken);
// 							this.isRefreshing = false;

// 							// Reintentar la petición original con el nuevo token
// 							return this.request<T>(endpoint, method, data, options);
// 						} catch (refreshError) {
// 							this.isRefreshing = false;
// 							this.refreshSubscribers = [];
// 							// AuthService.refreshToken ya limpia el auth si falla
// 							authService.logout();
// 							throw refreshError;
// 						}
// 					} else {
// 						// Si ya se está refrescando, encolar esta petición
// 						return new Promise<T>((resolve) => {
// 							this.addRefreshSubscriber(() => {
// 								resolve(this.request<T>(endpoint, method, data, options));
// 							});
// 						});
// 					}
// 				}

// 				const errorType = errorService.mapHttpToErrorType(response.status);
// 				throw new AppError(
// 					errorBody.message || 'Error en la solicitud',
// 					errorType,
// 					response.status
// 				);
// 			}

// 			return response.json();
// 		} catch (error) {
// 			clearTimeout(timeoutId);

// 			if (error instanceof DOMException && error.name === 'AbortError') {
// 				throw new AppError('Solicitud cancelada por timeout', ErrorType.NETWORK, 408);
// 			}

// 			if (error instanceof AppError) {
// 				throw error; // Re-throw AppError sin modificar
// 			}

// 			throw new AppError(
// 				'Error de red',
// 				ErrorType.NETWORK,
// 				undefined,
// 				error instanceof Error ? error : undefined
// 			);
// 		}
// 	}

// 	// Métodos para diferentes tipos de solicitudes
// 	async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
// 		return this.request<T>(endpoint, 'GET', undefined, options);
// 	}

// 	async post<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
// 		return this.request<T>(endpoint, 'POST', data, options);
// 	}

// 	async put<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
// 		return this.request<T>(endpoint, 'PUT', data, options);
// 	}

// 	async patch<T>(endpoint: string, data: unknown, options: RequestOptions = {}): Promise<T> {
// 		return this.request<T>(endpoint, 'PATCH', data, options);
// 	}

// 	async delete<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
// 		return this.request<T>(endpoint, 'DELETE', data, options);
// 	}

// 	/**
// 	 * Enviar FormData (multipart/form-data) — para subida de archivos.
// 	 * No usa Content-Type: application/json; el browser setea multipart/form-data automáticamente.
// 	 */
// 	async postFormData<T>(
// 		endpoint: string,
// 		formData: FormData,
// 		options: RequestOptions = {}
// 	): Promise<T> {
// 		const controller = new AbortController();
// 		const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

// 		try {
// 			const headers: Record<string, string> = {};

// 			// Auth header
// 			if (options.requireAuth !== false) {
// 				const token = authService.getToken();
// 				if (token) {
// 					headers.Authorization = `Bearer ${token}`;
// 				}
// 			}

// 			const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
// 				method: 'POST',
// 				headers, // Sin Content-Type — el browser lo pone automáticamente con boundary
// 				body: formData,
// 				signal: controller.signal
// 			});

// 			clearTimeout(timeoutId);

// 			if (response.status === 204) return {} as T;

// 			if (!response.ok) {
// 				const errorBody = await response.json().catch(() => ({}));

// 				// Si es error 401 y requiere auth, intentar refrescar el token
// 				if (response.status === 401 && options.requireAuth !== false) {
// 					if (!this.isRefreshing) {
// 						this.isRefreshing = true;
// 						try {
// 							const newToken = await authService.refreshToken();
// 							this.onRefreshed(newToken);
// 							this.isRefreshing = false;

// 							// Reintentar la petición original con el nuevo token
// 							return this.postFormData<T>(endpoint, formData, options);
// 						} catch (refreshError) {
// 							this.isRefreshing = false;
// 							this.refreshSubscribers = [];
// 							authService.logout();
// 							throw refreshError;
// 						}
// 					} else {
// 						// Si ya se está refrescando, encolar esta petición
// 						return new Promise<T>((resolve) => {
// 							this.addRefreshSubscriber(() => {
// 								resolve(this.postFormData<T>(endpoint, formData, options));
// 							});
// 						});
// 					}
// 				}

// 				const errorType = errorService.mapHttpToErrorType(response.status);
// 				throw new AppError(
// 					errorBody.message || 'Error en la solicitud',
// 					errorType,
// 					response.status
// 				);
// 			}

// 			return response.json();
// 		} catch (error) {
// 			clearTimeout(timeoutId);
// 			if (error instanceof DOMException && error.name === 'AbortError') {
// 				throw new AppError('Solicitud cancelada por timeout', ErrorType.NETWORK, 408);
// 			}
// 			if (error instanceof AppError) throw error;
// 			throw new AppError(
// 				'Error de red',
// 				ErrorType.NETWORK,
// 				undefined,
// 				error instanceof Error ? error : undefined
// 			);
// 		}
// 	}

// 	// Métodos específicos para endpoints que no requieren autenticación
// 	async getPublic<T>(endpoint: string): Promise<T> {
// 		return this.get<T>(endpoint, { requireAuth: false });
// 	}

// 	async postPublic<T>(endpoint: string, data: unknown): Promise<T> {
// 		return this.post<T>(endpoint, data, { requireAuth: false });
// 	}
// }

// export const apiMilenium = new ApiMilenium();
