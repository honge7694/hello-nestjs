import { Logger, QueryRunner } from 'typeorm';
import { coreLogger } from '../core/winston.config';

export class CustomTypeOrmLogger implements Logger {
	logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
		const params = parameters ? ` -- PARAMETERS: ${JSON.stringify(parameters)}` : '';
		coreLogger.debug(`[QUERY]: ${query}${params}`, { context: 'TypeORM' });
	}

	logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
		const params = parameters ? ` -- PARAMETERS: ${JSON.stringify(parameters)}` : '';
		coreLogger.error(`[QUERY ERROR]: ${error} - QUERY: ${query}${params}`, { context: 'TypeORM' });
	}

	logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
		coreLogger.warn(`[SLOW QUERY - ${time}ms]: ${query}`, { context: 'TypeORM' });
	}

	logSchemaBuild(message: string, queryRunner?: QueryRunner) {
		coreLogger.info(message, { context: 'TypeORM-Schema' });
	}

	logMigration(message: string, queryRunner?: QueryRunner) {
		coreLogger.info(message, { context: 'TypeORM-Migration' });
	}

	log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
		if (level === 'log' || level === 'info') {
			coreLogger.info(message, { context: 'TypeORM' });
		} else {
			coreLogger.warn(message, { context: 'TypeORM' });
		}
	}
}
