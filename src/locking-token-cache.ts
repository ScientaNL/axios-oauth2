import {createHash} from "crypto";
import {LockingCache} from "@scienta/locking-cache";
import {AuthClient, AuthenticationClientOptions} from "./auth-client";
import {TokenCache} from "./token-interceptor";

export class LockingTokenCache implements TokenCache
{
	constructor(
		private readonly lockingCache: LockingCache<string> = new LockingCache<string>(),
		public defaultLockTimeout: number = 2000
	) {}

	public getToken(authClient: AuthClient): Promise<string|null|undefined> {
		const lockDuration = authClient.requestConfig.timeout ?? this.defaultLockTimeout;
		return this.lockingCache.getValue(
			this.generateTokenCacheKey(authClient.options),
			() => authClient().then(response => ({
				value: response.access_token,
				expiresInSec: response.expires_in
			})),
			lockDuration
		);
	}

	protected generateTokenCacheKey(authOptions: AuthenticationClientOptions): string {
		const keyParts = [authOptions.url, authOptions.grant_type, authOptions.client_id];
		if (authOptions.scope?.length) {
			keyParts.push(authOptions.scope.join(','));
		}
		return this.hashKey(keyParts.join('-'));
	}

	private hashKey(key: string): string {
		return createHash('md5').update(key).digest('hex');
	}
}
