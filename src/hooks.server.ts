import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: import.meta.env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0
});

// If you have existing hooks, import them and add to sequence
export const handle = sequence(sentryHandle());
// Custom error handler to log errors explicitly (Bun/VPS debugging)
const sentryErrorHandler = handleErrorWithSentry();

export const handleError = async (input) => {
    console.error('[SERVER ERROR]', input.error);
    return sentryErrorHandler(input);
};
