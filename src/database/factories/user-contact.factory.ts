/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserEntity } from '@modules/user/user.entity';
import { UserContactEntity } from '@modules/user/user-contact.entity';
import { define, factory } from 'typeorm-seeding';

define(UserContactEntity, (faker) => {
    const facebook = faker.name.findName();

    const contact = new UserContactEntity();
    contact.facebook = facebook;
    contact.twitter = facebook;
    contact.behance = facebook;
    contact.email = facebook;
    contact.userAddress = factory(UserEntity)({ roles: [] }) as any;

    return contact;
});
