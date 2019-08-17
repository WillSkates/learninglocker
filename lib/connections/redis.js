import Redis from 'ioredis';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import url = require('url');

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_DB = 0;

export const loadCredentialsFromEnvironment() => {
	const eventsRepo = defaultTo(process.env.EVENTS_REPO, 'redis');

	if (eventsRepo === 'sentinel') {
		const db = defaultTo(Number(process.env.SENTINEL_DB), 0);
		const name = defaultTo(process.env.SENTINEL_NAME, 'mymaster');
		const connections = defaultTo(process.env.SENTINEL_CONNECTIONS, DEFAULT_REDIS_HOST + ':' + DEFAULT_REDIS_PORT);
		const password = process.env.SENTINEL_PASSWORD;

		const sentinels = connections.split(' ').map((conn) => {
			const [host, port] = conn.split(':');
			return {
				host: host,
				port: defaultTo(Number(port), DEFAULT_REDIS_PORT)
			};
		});

		return {
			db: db,
			password: password,
			name: name,
			sentinels: sentinels
		};
	} else if (process.env.REDIS_URL) {
		const url = new URL(process.env.REDIS_URL);
		const urlString = url.toString();

		return process.env.REDIS_URL;
	}
	
	const creds = {
		db: defaultTo(Number(process.env.REDIS_DB), 0),
		host: defaultTo(process.env.REDIS_HOST, DEFAULT_REDIS_HOST),
		port: defaultTo(Number(process.env.REDIS_PORT), DEFAULT_REDIS_PORT)
	};
	
	if (process.env.REDIS_PASSWORD) {
		creds["password"] = process.env.REDIS_PASSWORD;
	}

	return creds;
}

export const createClient = () => {
	const creds = loadCredentialsFromEnvironment();
	try {
		return new Redis(creds);
	} catch(e) {
		logger.error('Couldn\'t connect to Redis!', e);
	}
};
