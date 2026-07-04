import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare const jwtConfig: (configService: ConfigService) => JwtModuleOptions;
