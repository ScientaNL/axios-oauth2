import { AxiosInstance, AxiosRequestConfig } from "axios";
import * as qs from "qs";
import {AuthenticationFailedError} from "./errors/authentication-failed-error";

export interface AuthClient {
	(): Promise<AuthenticationResponseJson>;
	options: AuthenticationClientOptions;
	requestConfig: AxiosRequestConfig;
}

export interface AuthenticationResponseJson {
	token_type: string;
	expires_in: number;
	access_token: string;
}

export interface AuthenticationClientOptions {
	url: string,
	grant_type: string,
	client_id: string,
	client_secret: string,
	username?: string,
	password?: string,
	code?: string,
	refresh_token?: string,
	scope?: string[]
	sub?: string
}

export const AuthClientFactory = (
	axiosInstance: AxiosInstance,
	options: AuthenticationClientOptions,
	requestConfig: AxiosRequestConfig = { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
): AuthClient => {
	const { url, ...credentials } = options;
	const config = Object.assign(requestConfig, {
		url: url,
		method: 'POST',
		data: qs.stringify(credentials),
		responseType: 'json'
	});

	const client = function () {
		return axiosInstance.request(config).then((res) => {
			const valid = typeof res.data === 'object' &&
				['token_type', 'expires_in', 'access_token'].every(
					key => Object.keys(res.data).includes(key)
				);
			if (!valid) {
				throw new AuthenticationFailedError(
					'Unable to authenticate or incorrect auth response', config, res
				);
			}
			return res.data as AuthenticationResponseJson;
		});
	};
	client.options = options;
	client.requestConfig = requestConfig;
	return client;
};
