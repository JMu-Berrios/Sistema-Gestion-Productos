"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const cors_1 = __importDefault(require("cors"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cors_1.default)({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const frontendPath = (0, path_1.join)(__dirname, '..', '..', 'fronted', 'src');
    const publicPath = (0, path_1.join)(__dirname, '..', '..', 'fronted', 'public');
    app.useStaticAssets(publicPath);
    app.useStaticAssets(frontendPath, {
        prefix: '/src',
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/', (req, res) => {
        res.sendFile((0, path_1.join)(frontendPath, 'index.html'));
    });
    app.setGlobalPrefix('api-tienda');
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Aplicación ejecutándose en mi servidor: http://localhost:${port}`);
}
bootstrap().catch((err) => {
    console.error('Error al iniciar la aplicación de mi servidor:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map