import { UserNotFoundException } from '@exceptions/user-not-found.exception';
import { UserRepository } from '@modules/user/user.repository';
import { UserService } from '@modules/user/user.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { DeleteDto } from 'shared/dto/delete-dto';
import { Transactional } from 'typeorm-transactional-cls-hooked';

import { ClassroomRepository } from './classroom.repository';
import type { ClassroomDto } from './dto/classroom.dto';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import type { GetClassroomsDto } from './dto/get-classroom.dto';
import type { JoinUsersDto } from './dto/join-users.dto';
import type { RemoveUserFromClassroomDto } from './dto/remove-user-from-classroom.dto';
import type { UpdateClassroomDto } from './dto/update-classroom.dto';
import type { UpdateStatusClassroom } from './dto/update-status-classroom.dto';
import type { ClassroomEntity } from './entities/classroom.entity';

@Injectable()
export class ClassroomService {
    constructor(
        private classroomRepository: ClassroomRepository,
        private userRepository: UserRepository,
        private userService: UserService,
    ) {}

    @Transactional()
    async createClassroom(
        createClassroomDto: CreateClassroomDto,
    ): Promise<ClassroomEntity> {
        const classroom = this.classroomRepository.create(createClassroomDto);
        await this.classroomRepository.save(classroom);

        return classroom;
    }

    async joinUsersToClassroom(joinUsersDto: JoinUsersDto) {
        const { userIds, classroomId } = joinUsersDto;

        const isExistedUsers = this.userRepository
            .createQueryBuilder('user')
            .where('user.id IN (:...userIds)', { userIds });

        if (!isExistedUsers) {
            throw new UserNotFoundException();
        }

        const isExistedClassroom = await this.getByClassroomId(classroomId);

        if (!isExistedClassroom) {
            throw new NotFoundException('Invalid Classroom');
        }

        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .leftJoinAndSelect('classroom.users', 'user')
            .where('classroom.id = :classroomId', { classroomId })
            .getOne();
        const students = await isExistedUsers.getMany();

        if (!classroom || !students) {
            throw new UserNotFoundException();
        }

        classroom.users.push(...students);
        await this.classroomRepository.save(classroom);

        return { success: true };
    }

    async removeUserFromClassroom(
        removeUserFromClassroomDto: RemoveUserFromClassroomDto,
    ) {
        const { userId, classroomId } = removeUserFromClassroomDto;

        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .leftJoinAndSelect('classroom.users', 'user')
            .where('classroom.id = :classroomId', { classroomId })
            .getOne();

        const user = await this.userRepository
            .createQueryBuilder('user')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!classroom || !user) {
            throw new NotFoundException('Error when get classroom and user!');
        }

        classroom.users = classroom.users.filter((item) => item.id !== user.id);
        await this.classroomRepository.save(classroom);

        return { success: true };
    }

    // GET

    async getClassrooms(
        getClassroomsDto: GetClassroomsDto,
    ): Promise<ClassroomDto[]> {
        const { status, keySearch } = getClassroomsDto;

        const query = this.classroomRepository.createQueryBuilder('classroom');

        if (status) {
            query.andWhere('classroom.status = :status', { status });
        }

        if (keySearch) {
            query.andWhere('classroom.title LIKE :keySearch', {
                keySearch: `%${keySearch}%`,
            });
        }

        const classrooms = await query.getMany();

        if (!classrooms) {
            throw new NotFoundException('Classrooms not found!');
        }

        return classrooms;
    }

    async getByClassroomId(classroomId: string) {
        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .where('classroom.id = :classroomId', { classroomId })
            .getOne();

        if (!classroom) {
            throw new NotFoundException('Classroom not found!');
        }

        return classroom;
    }

    async getClassroomsByUserId(userId: string): Promise<ClassroomEntity[]> {
        const userClassrooms = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.classrooms', 'classroom')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!userClassrooms) {
            throw new UserNotFoundException();
        }

        return userClassrooms.classrooms;
    }

    // UPDATE

    async updateStatus(
        classroomId: string,
        updateStatusClassroom: UpdateStatusClassroom,
    ): Promise<ClassroomEntity> {
        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .where('classroom.id = :classroomId', { classroomId })
            .getOne();

        if (!classroom) {
            throw new NotFoundException('Classroom not found!');
        }

        classroom.status = updateStatusClassroom.status;
        await this.classroomRepository.save(classroom);

        return classroom;
    }

    async updateClassroom(
        id: string,
        updateClassroomDto: UpdateClassroomDto,
    ): Promise<ClassroomEntity> {
        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .where('classroom.id = :id', { id })
            .getOne();

        if (!classroom) {
            throw new NotFoundException('Classroom not found!');
        }

        const updateClassroom = this.classroomRepository.merge(
            classroom,
            updateClassroomDto,
        );
        await this.classroomRepository.save(updateClassroom);

        return updateClassroom;
    }

    // DELETE

    async deleteClassroom(id: string): Promise<DeleteDto> {
        const classroom = await this.classroomRepository
            .createQueryBuilder('classroom')
            .where('classroom.id = :id', { id })
            .getOne();

        if (!classroom) {
            throw new NotFoundException('Classroom not found!');
        }

        await this.classroomRepository.remove(classroom);

        return { success: true };
    }
}
