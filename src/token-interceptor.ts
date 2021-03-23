import {AxiosRequestConfig} from "axios";
import {AuthClient} from "./auth-client";
import {InvalidRequestError} from "./errors/invalid-request-error";

export type RequestInterceptor = (config: AxiosRequestConfig) => Promise<AxiosRequestConfig>;

export interface TokenCache {
	getToken(authClient: AuthClient, ...args: any[]): Promise<string|null|undefined>;
}

export const interceptorFactory = (authClient: AuthClient, tokenCache?: TokenCache): RequestInterceptor => (config: AxiosRequestConfig) => {
	if (!config.headers) {
		config.headers = {};
	} else if (typeof config.headers != 'object') {
		return Promise.reject(new InvalidRequestError(
			'Request-headers must be an object to add correct auth headers',
			config
		));
	}

	// Do not overwrite a configured client
	if (config.headers['Authorization']) {
		return Promise.resolve(config);
	}

	const tokenPromise = tokenCache ? tokenCache.getToken(authClient) :
		authClient().then(response => response.access_token);

	// Request a authorization token (from cache) and cache it
	return tokenPromise.then((token) => {
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	});
};
