import {AxiosRequestConfig} from "axios";

export class InvalidRequestError extends Error {
	public readonly requestConfig: AxiosRequestConfig;

	constructor(message: string, requestConfig: AxiosRequestConfig) {
		super(message);
		this.requestConfig = requestConfig;
	}
}
