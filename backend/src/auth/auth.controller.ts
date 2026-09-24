import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('logout')
  logout(@CurrentUser() user: any) { return this.auth.logout(user.sub); }
}
