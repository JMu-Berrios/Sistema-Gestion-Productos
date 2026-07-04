"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const parseDatabaseUrl = (databaseUrl) => {
    const parsed = new URL(databaseUrl);
    return {
        host: parsed.hostname,
        port: Number(parsed.port || 3306),
        username: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname?.slice(1) || '',
    };
};
const databaseConfig = (configService) => {
    const databaseUrl = configService.get('DATABASE_URL');
    const connectionOptions = databaseUrl
        ? parseDatabaseUrl(databaseUrl)
        : {
            host: configService.get('DB_HOST'),
            port: Number(configService.get('DB_PORT') || 3306),
            username: configService.get('DB_USER'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_NAME'),
        };
    return {
        type: 'mysql',
        ...connectionOptions,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: false,
        logging: true,
    };
};
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map