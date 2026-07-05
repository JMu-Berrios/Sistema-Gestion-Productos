require('dotenv/config');
const { DataSource } = require('typeorm');

module.exports = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  port: Number(process.env.DB_PORT) || 36311,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'XkDWojxODAkRSlNGELPMWKCgdQxJQxpM',
  database: process.env.DB_NAME || 'sistema_gestion',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});
