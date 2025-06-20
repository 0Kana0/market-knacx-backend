// database.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  static forRoot(options: TypeOrmModuleOptions, connectionName?: string): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          ...options,
          name: connectionName,  // ตั้งชื่อ connection เพื่อแยก DB
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
