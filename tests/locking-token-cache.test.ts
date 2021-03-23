import {expect} from "chai";
import {describe} from "mocha";
import sinon from "sinon";
import axios from "axios";
import {AuthClient, clientFactory, LockingTokenCache} from "../src";

const authClientOptions = { url : '/fooBarBaz', client_id: 'foo', client_secret: 'bar', grant_type: 'baz'};

describe('locking-token-cache', () => {
	it('should cache and request token', async () => {
		const authResponseJson = { token_type: 'foo', expires_in: 3, access_token: 'bar'};
		const axiosInstance = axios.create();
		sinon.stub(axiosInstance, 'request').resolves({
			status: 200,
			data: authResponseJson
		});

		const authClient = clientFactory(axiosInstance, authClientOptions);
		const clientSpy = sinon.spy<AuthClient>(authClient);
		const cache = new LockingTokenCache();

		const result = await cache.getToken(clientSpy as unknown as AuthClient);
		expect(result).to.eq(authResponseJson.access_token);
		expect(clientSpy.callCount).to.eq(1);
	});
});
