import { RoleType } from '@constants/role-type';
import { ApiPageOkResponse } from '@decorators/api-page-ok-response.decorator';
import { AuthUser } from '@decorators/auth-user.decorator';
import { Auth } from '@decorators/http.decorators';
import { UserEntity } from '@modules/user/user.entity';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AddFreeTagsDto } from './dto/create-tag.dto';
import { CreateSyllabusTagsDto } from './dto/syllabus-tags.dto';
import { TagDto } from './dto/tag.dto';
import { JoinTagsToPost } from './dto/tags-to-post.dto';
import { TagService } from './tag.service';

@Controller('tags')
@ApiTags('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    // POST

    @Post('syllabus')
    @Auth([RoleType.TEACHER])
    @HttpCode(HttpStatus.OK)
    @ApiPageOkResponse({
        description: 'create syllabus tags',
        type: TagDto,
    })
    createSyllabusTags(
        @AuthUser() user: UserEntity,
        @Body() createSyllabusTagsDto: CreateSyllabusTagsDto,
    ) {
        return this.tagService.createSyllabusTags(user, createSyllabusTagsDto);
    }

    @Post('free')
    @Auth([RoleType.TEACHER, RoleType.ADMIN, RoleType.STUDENT])
    @HttpCode(HttpStatus.OK)
    @ApiPageOkResponse({
        description: 'create free tags',
        type: TagDto,
    })
    createFreeTags(
        @AuthUser() user: UserEntity,
        @Body() addFreeTagsDto: AddFreeTagsDto,
    ) {
        return this.tagService.createFreeTags(user, addFreeTagsDto);
    }

    @Post('tags-to-post')
    @Auth([RoleType.STUDENT, RoleType.TEACHER])
    @HttpCode(HttpStatus.OK)
    @ApiPageOkResponse({
        description: 'join tags to post',
        type: TagDto,
    })
    joinTagsToPost(@Body() joinTagsToPost: JoinTagsToPost) {
        return this.tagService.joinTagsToPost(joinTagsToPost);
    }

    // GET

    @Get('/tag-by-classroom/:classroomId')
    @Auth([RoleType.TEACHER, RoleType.ADMIN, RoleType.STUDENT])
    @HttpCode(HttpStatus.OK)
    @ApiPageOkResponse({
        description: 'get tags',
        type: TagDto,
    })
    getTagsByClassroom(@Param('classroomId') classroomId: string) {
        return this.tagService.getTagsByClassroom(classroomId);
    }

    // UPDATE

    // DELETE

    @Delete('/syllabus/:chapterId')
    @Auth([RoleType.TEACHER])
    @HttpCode(HttpStatus.OK)
    @ApiPageOkResponse({
        description: 'Delete chapter tags in syllabus',
        type: TagDto,
    })
    deleteChapterTags(@Param('chapterId') chapterId: string) {
        return this.tagService.deleteChapterTags(chapterId);
    }
}
