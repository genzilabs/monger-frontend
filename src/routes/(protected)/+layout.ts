import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const load: LayoutLoad = async () => {
	if (browser) {
		const accessToken = localStorage.getItem('monger_access_token');
		if (!accessToken) {
			throw redirect(302, '/auth');
		}
	}
	
	return {};
};
