import {expect} from "chai";
import {describe} from "mocha";
import {AuthTokenInterceptorFactory, RequestInterceptor} from "../src/auth-token-interceptor";
import {AuthenticationClientOptions, AuthenticationResponseJson} from "../src/auth-client";
import {AxiosRequestConfig} from "axios";

const createInterceptor = (
	authResponseJson: AuthenticationResponseJson,
	clientOptions: AuthenticationClientOptions = { url : '/', client_id: 'foo', client_secret: 'bar', grant_type: 'baz'},
	authRequestConfig: AxiosRequestConfig = {}
): RequestInterceptor => {
	const authClient = () => Promise.resolve(authResponseJson);
	authClient.options = clientOptions;
	authClient.requestConfig = authRequestConfig;
	return AuthTokenInterceptorFactory(authClient);
}

describe('token-interceptor', () => {
	it('should request token and configure client', async () => {
		const authResponseJson = { token_type: 'foo', expires_in: 3, access_token: 'bar'};
		const interceptor = createInterceptor(authResponseJson);

		const requestConfig = {};
		const result = await interceptor(requestConfig);

		expect(requestConfig).to.eq(result);
		expect(result).to.have.nested.property('headers.Authorization');
		expect(result.headers.Authorization).to.include(authResponseJson.access_token);
	});

	it('should not request token for configured client', async () => {
		const authResponseJson = { token_type: 'foo', expires_in: 3, access_token: 'bar'};
		const interceptor = createInterceptor(authResponseJson);

		const authorizedHeader = 'baz';
		const requestConfig = { headers: { Authorization: authorizedHeader }};
		const result = await interceptor(requestConfig);

		expect(requestConfig).to.eq(result);
		expect(result).to.have.nested.property('headers.Authorization');
		expect(result.headers.Authorization).to.eq(authorizedHeader);
	});

	it('should error on token request error', async () => {
		const error = new Error('fooBar');
		const authClient = () => Promise.reject(error);
		authClient.options = { url : '/', client_id: 'foo', client_secret: 'bar', grant_type: 'baz'};
		authClient.requestConfig = {};
		const interceptor = AuthTokenInterceptorFactory(authClient);

		const requestConfig = {};
		let result, requestError;
		try {
			result = await interceptor(requestConfig);
		} catch (e) {
			requestError = e;
		}

		expect(result).to.eq(undefined);
		expect(requestError).to.eq(error);
	});
});
