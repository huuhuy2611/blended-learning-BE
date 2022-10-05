import type { IAbstractEntity } from '@common/abstract.entity';
import { AbstractEntity } from '@common/abstract.entity';
import { UseDto } from '@decorators/index';
import { PostEntity } from '@modules/post/entities/post.entity';
import { UserEntity } from '@modules/user/user.entity';
import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import type { ClassroomDtoOptions } from '../dto/classroom.dto';
import { ClassroomDto } from '../dto/classroom.dto';

export interface IClassroomEntity extends IAbstractEntity<ClassroomDto> {
    id: Uuid;

    title: string;

    resources: string;

    users: UserEntity[];

    posts?: PostEntity[];
}

@Entity({ name: 'classroom' })
@UseDto(ClassroomDto)
export class ClassroomEntity
    extends AbstractEntity<ClassroomDto, ClassroomDtoOptions>
    implements IClassroomEntity
{
    @PrimaryGeneratedColumn('uuid')
    id: Uuid;

    @Column({ unique: true, nullable: false })
    title: string;

    @Column({ nullable: true })
    resources: string;

    @ManyToMany(() => UserEntity, (user) => user.classrooms)
    @JoinTable({
        name: 'user_classroom',
        joinColumn: {
            name: 'classroom_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
    })
    users: UserEntity[];

    @OneToMany(() => PostEntity, (post) => post.user)
    @JoinColumn()
    posts: PostEntity[];
}