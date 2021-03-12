import {AxiosRequestConfig, AxiosResponse} from "axios";

export class AuthenticationFailedError extends Error {
	public readonly requestConfig: AxiosRequestConfig;
	public readonly response: AxiosResponse;

	constructor(message: string, requestConfig: AxiosRequestConfig, response: AxiosResponse) {
		super(message);
		this.requestConfig = requestConfig;
		this.response = response;
	}
}
