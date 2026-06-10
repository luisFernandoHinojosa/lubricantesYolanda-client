import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
export const redirect = (url: string, replaceState: boolean = false): void => {
	goto(resolve(url), { replaceState });
};
