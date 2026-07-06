import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        token: string;
        usuario: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        usuario: any;
    }>;
    health(): {
        status: string;
    };
}
