import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

import { compare, hash } from 'bcrypt'; 
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    console.log('createAuthDto', createAuthDto);
    
    const user = await this.validateUser(createAuthDto)
    const payload = {
      username: user.email,
      sub: {
        name: user.name
      }
    }

    // สร้าง accessToken
    const accessToken = await this.jwtService.signAsync(
      payload, 
      { 
        expiresIn: '15m',
        secret: process.env.JWT_SECRET || "qoutetoken"
      },
    );
    // สร้าง refreshToken
    const refreshToken = this.jwtService.sign(
      payload, 
      { 
        expiresIn: '7d',
        secret: process.env.JWT_SECRET || "qoutetoken"
      },
    );

    // เก็บ refreshToken ที่ hash แล้วใน database
    this.usersRepository.update(user.id, {
      refresh_token: await hash(refreshToken, 10),
    });

    const { refresh_token, ...safeUser } = user;
    const userSend = {
      ...safeUser,
      token: {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
    };

    return {
      user: userSend,
    };
  }

  async validateUser(createAuthDto: CreateAuthDto) {
    const user = await this.userService.findByEmail(createAuthDto.email)

    if (createAuthDto.password[0] == '$') {
      // ตรวจสอบว่า register หรือยังและกรอกรหัสผ่านตรงหรือไม่
      if(user && createAuthDto.password == user.password) {
        const {password, ...result} = user
        return result
      }
      throw new UnauthorizedException('password incorrect')
    } else {
      // ตรวจสอบว่า register หรือยังและกรอกรหัสผ่านตรงหรือไม่
      if(user && await compare(createAuthDto.password, user.password)) {
        const {password, ...result} = user
        return result
      }
      throw new UnauthorizedException('password incorrect')
    }
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersRepository.findOne({ 
      where: { 
        id: userId 
      }
    });
    if (!user || !user.refresh_token) throw new ForbiddenException();

    // ถ้า refreshToken ที่ส่งมาตรงกับ refreshToken ที่ hash ใน database ให้ทำ login ใหม่
    const isMatch = await compare(refreshToken, user.refresh_token);
    if (!isMatch) throw new ForbiddenException('invalid refresh token');

    console.log('user', user);
    
    return this.login(user);
  }

  async logout(userId: number) {
    const user = await this.usersRepository.findOne({ 
      where: { 
        id: userId 
      }
    });

    if (!user) {
      throw new NotFoundException(`user id ${userId} not found`);
    }
    
    // ลบ refreshToken ออก
    return await this.usersRepository.update(userId, { refresh_token: '' });
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
