import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CompaniesService } from '../companies/companies.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/constants/roles.constant';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly companies: CompaniesService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const company = await this.companies.create({
      name: dto.companyName,
      slug: this.slug(dto.companyName),
      phone: dto.phone,
    });

    const user = await this.users.create({
      companyId: company._id.toString(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      role: UserRole.OWNER,
    });

    return this.tokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) throw new UnauthorizedException('Account disabled');
    await this.users.updateLastLogin(user._id.toString());
    return this.tokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') throw new Error();
      const user = await this.users.findById(payload.sub, payload.companyId);
      if (!user?.refreshTokenHash) throw new Error();
      if (!(await bcrypt.compare(refreshToken, user.refreshTokenHash))) throw new Error();
      return this.tokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(userId: string) {
    return this.users.updateRefreshToken(userId, null);
  }

  private async tokens(user: any) {
    const base = {
      sub: user._id.toString(),
      companyId: user.companyId.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    const accessToken = await this.jwt.signAsync(
      { ...base, type: 'access' },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as JwtSignOptions['expiresIn'],
      },
    );

    await this.users.updateRefreshToken(
      user._id.toString(),
      await bcrypt.hash(refreshToken, 12),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        companyId: user.companyId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  private slug(name: string) {
    return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`;
  }
}
