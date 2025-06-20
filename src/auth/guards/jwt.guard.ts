import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtGuard implements CanActivate{
  constructor(private jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    // ดึง request ออกมา
    const request = context.switchToHttp().getRequest()
    // เเยก token ออกจาก header
    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException("token not sent or token expired")
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || "qoutetoken"
      })
      request['user'] = payload
    } catch {
      throw new UnauthorizedException("must login to access this information.");
    }

    return true
  }

  private extractTokenFromHeader(request: Request) {
    // เเยก Bearer ออกจาก token
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
    }
}