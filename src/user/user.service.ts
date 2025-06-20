import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { hash } from 'bcrypt';
import * as zxcvbn from 'zxcvbn';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // ยืนยัน password
    if (createUserDto.password !== createUserDto.c_password) throw new ConflictException('password not match')

    // ตรวจสอบว่า email นี้ใช้ไปหรือยัง
    const user = await this.usersRepository.findOne({
      where: {
        email: createUserDto.email
      }
    })
    if (user) throw new ConflictException('email have already use')

    // ตรวจสอบความปลอดภัยของ password
    const checkPassword = zxcvbn(createUserDto.password);
    if (checkPassword.score < 3) {
      throw new BadRequestException('password is too easy, please choose a harder one');
    }

    const { c_password, ...safeData } = createUserDto;

    const newUser = this.usersRepository.create({
      ...safeData,
      // ทำการ hash password ก่อนเก็บลง database
      password: await hash(createUserDto.password, 10),
    })

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...result } = savedUser;
    return result;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email: email
      }
    })

    if (!user) throw new NotFoundException('email incorrect')
    return user
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
