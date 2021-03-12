import {expect} from "chai";
import {describe} from "mocha";
import sinon from "sinon";
import axios, {AxiosError} from "axios";
import {AuthClientFactory} from "../src/auth-client";
import {AuthenticationFailedError} from "../src/errors/authentication-failed-error";

const authClientOptions = { url : '/fooBarBaz', client_id: 'foo', client_secret: 'bar', grant_type: 'baz'};

describe('auth-client', () => {
	it('should request token', async () => {
		const authResponseJson = { token_type: 'foo', expires_in: 3, access_token: 'bar'};
		const axiosInstance = axios.create();
		sinon.stub(axiosInstance, 'request').resolves({
			status: 200,
			data: authResponseJson
		});

		const authClient = AuthClientFactory(axiosInstance, authClientOptions);
		const result = await authClient();
		expect(result).to.eq(authResponseJson);
	});

	it('should error on request error', async () => {
		const authResponse = {
			status: 500,
			data: { error: 'fooBar'}
		};
		const axiosInstance = axios.create();
		sinon.stub(axiosInstance, 'request').resolves(authResponse);

		const authClient = AuthClientFactory(axiosInstance, authClientOptions);
		let error: AxiosError|null = null, result = null;
		try {
			result = await authClient();
		} catch (e) {
			error = e;
		}
		expect(result).to.eq(null);
		expect(error).to.be.an.instanceof(Error);
		expect(error?.response).to.eq(authResponse);
	});

	it('should error on invalid token response', async () => {
		const authResponseJson = {
			status: 200,
			data: { foo: 'bar'}
		};
		const axiosInstance = axios.create();
		sinon.stub(axiosInstance, 'request').resolves(authResponseJson);

		const authClient = AuthClientFactory(axiosInstance, authClientOptions);
		let error: AuthenticationFailedError|null = null, result = null;
		try {
			result = await authClient();
		} catch (e) {
			error = e;
		}

		expect(result).to.eq(null);
		expect(error).to.be.an.instanceof(Error);
		expect(error).to.be.an.instanceof(Error);
		expect(error?.response).to.eq(authResponseJson);
		expect(error?.requestConfig.url).to.eq(authClientOptions.url);
	});
});
