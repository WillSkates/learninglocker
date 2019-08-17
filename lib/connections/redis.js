import Redis from 'ioredis';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import url = require('url');

const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_REDIS_HOST = '127.0.0.1';
const DEFAULT_REDIS_ADDRESS = DEFAULT_REDIS_HOST + ':' + DEFAULT_REDIS_PORT;
const DEFAULT_REDIS_DB = 0;

export const extractEnvValue(varName, defaultValue)
{
	const value = process.env[varName];

	if (
		value !== null
		&& typeof value !== "undefined"
		&& (
			typeof value === "number"
			|| typeof value === "string"
		)
	) {
		return value;
	}

	logger.warn('Redis: No "' + varName + '" set. using"' + defaultValue + '" instead.');

	return defaultValue;
}

export const loadCredentialsFromEnvironment() => {
	const eventsRepo = defaultTo(process.env.EVENTS_REPO, 'redis');
	const logInsecure = defaultTo(process.env.LOG_INSECURE, false);

	if (eventsRepo === 'sentinel') {
		const connections = extractEnvValue('SENTINEL_CONNECTIONS', DEFAULT_REDIS_ADDRESS);

		const sentinels = connections.split(' ').map((conn) => {
			const [host, port] = conn.split(':');
			return {
				host: host,
				port: defaultTo(Number(port), DEFAULT_REDIS_PORT)
			};
		});
		
		var creds = {
			db: Number(extractEnvValue('SENTINEL_DB', 0)),
			name: extractEnvValue('SENTINEL_NAME', 'mymaster'),
			sentinels: sentinels
		};
		
		if (logInsecure === false) {
			logger.silly('REDIS: Creating Sentinel Client from environment', creds);
		}

		if (process.env.SENTINEL_PASSWORD) {
			creds['password'] = process.env.SENTINEL_PASSWORD;
		}
		
		if (logInsecure !== false) {
			logger.silly('REDIS: Creating Sentinel Client from environment', creds);
		}

		return creds;
	} else if (process.env.REDIS_URL) {
		const url = new URL(process.env.REDIS_URL);
		
		if (logInsecure === false) {
			logger.silly(
				'REDIS: Creating Redis Client using URL',
				url.toString(
			   	   .replace(url.password, '')
			   	   .replace(url.username + ':', '')
				   .replace(url.username, '')
			);
		} else {
			logger.silly('REDIS: Creating Redis Client using URL', url.toString());
		}

		return process.env.REDIS_URL;
	}
	
	var creds = {
		db: Number(extractEnvValue('REDIS_DB', 0)),
		host: extractEnvValue('REDIS_HOST', DEFAULT_REDIS_HOST),
		port: Number(extractEnvValue('REDIS_PORT', DEFAULT_REDIS_PORT))
	};
	
	if (logInsecure === false) {
		logger.silly('REDIS: Creating Redis Client from environment', creds);	
	}

	if (process.env.REDIS_PASSWORD) {
		creds["password"] = process.env.REDIS_PASSWORD;
	}

	if (logInsecure !== false) {
		logger.silly('REDIS: Creating Redis Client from environment', creds);	
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
