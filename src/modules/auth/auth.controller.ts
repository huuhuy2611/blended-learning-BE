/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { RoleType } from '@constants/index';
import { Auth, AuthUser } from '@decorators/index';
import { UserNotFoundException } from '@exceptions/index';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from '@user/dtos/user.dto';
import { UserEntity } from '@user/user.entity';
import { UserService } from '@user/user.service';

import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { UserLoginDto } from './dto/UserLoginDto';
import { UserRegisterDto } from './dto/UserRegisterDto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginPayloadDto,
        description: 'User info with access token',
    })
    @ApiException(() => [UserNotFoundException])
    async userLogin(
        @Body() userLoginDto: UserLoginDto,
    ): Promise<LoginPayloadDto> {
        const userEntity = await this.authService.validateUser(userLoginDto);

        const token = await this.authService.createAccessToken({
            userEmail: userEntity.email,
            role: userEntity.role,
        });

        return new LoginPayloadDto(userEntity.toDto(), token);
    }

    @Post('register')
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.ADMIN])
    @ApiOkResponse({ type: UserDto, description: 'Successfully Registered' })
    async userRegister(
        @Body() userRegisterDto: UserRegisterDto,
    ): Promise<UserDto> {
        const createdUser = await this.userService.createUser(userRegisterDto);

        return createdUser.toDto({
            isActive: true,
        });
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @Auth([RoleType.STUDENT, RoleType.ADMIN, RoleType.TEACHER])
    @ApiOkResponse({ type: UserDto, description: 'current user info' })
    getCurrentUser(@AuthUser() user: UserEntity): UserDto {
        return user.toDto();
    }
}
