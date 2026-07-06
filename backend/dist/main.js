"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.ORIGEN_CORS || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const frontendPath = (0, path_1.join)(__dirname, '..', '..', 'frontend', 'src');
    const publicPath = (0, path_1.join)(__dirname, '..', '..', 'frontend', 'public');
    app.useStaticAssets(publicPath);
    app.useStaticAssets(frontendPath, {
        prefix: '/src',
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/', (req, res) => {
        res.sendFile((0, path_1.join)(frontendPath, 'pages/auth/login.html'));
    });
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Aplicación ejecutándose en mi servidor: http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error('Error al iniciar la aplicación de mi servidor:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map