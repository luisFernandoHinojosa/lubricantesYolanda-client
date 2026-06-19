import { writable, derived } from 'svelte/store';
import type { LoginCredentials, CurrentUser } from '$lib/interfaces';
import { authService } from '$lib/services';

// Store for current user data
export const currentUserStore = writable<CurrentUser | null>(authService.getCurrentUser());

// Derived store to check authentication status
export const isAuthenticated = derived(currentUserStore, ($user) => $user !== null);

// Store for loading states
export const isLoading = writable<boolean>(false);

export const authStore = {
	/**
	 * Performs login and updates the store with user data
	 */
	login: async (credentials: LoginCredentials) => {
		isLoading.set(true);
		try {
			const loginResponse = await authService.login(credentials);
			console.log('🚀 ~ login ~ loginResponse:', loginResponse);
			// login() internally calls getMe() which saves to localStorage
			// Now sync the store with what was saved
			const userData = authService.getCurrentUser();
			if (userData) {
				currentUserStore.set(userData);
			}
			return loginResponse;
		} finally {
			isLoading.set(false);
		}
	},

	/**
	 * Refreshes user data from the server
	 */
	refreshUser: async () => {
		try {
			const userData = await authService.getMe();
			currentUserStore.set(userData);
		} catch (error) {
			console.error('Error refreshing user data:', error);
			// Optional: logout if me() fails?
		}
	},

	/**
	 * Directly sets the user data in the store and service
	 */
	setUser: (userData: CurrentUser) => {
		currentUserStore.set(userData);
		authService.setCurrentUser(userData);
	},

	/**
	 * Clears auth data and redirects to login
	 */
	logout: () => {
		currentUserStore.set(null);
		authService.logout();
	},

	setLoading: (loading: boolean) => {
		isLoading.set(loading);
	}
};
