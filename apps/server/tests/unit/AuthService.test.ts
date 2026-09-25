import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../../src/application/services/AuthService.js';
import type { User } from '../../src/domain/entities/User.js';
import { InvalidAuthCredentialsError } from '../../src/domain/errors/InvalidAuthCredentialsError.js';
import { InvalidEmailError } from '../../src/domain/errors/InvalidEmailError.js';
import {
    FakePasswordHasher,
    FakeSessionRepository,
    FakeSessionTokenGenerator,
    FakeUserRepository,
    user,
} from '../fakes/AuthFakes.js';

function createService(initialUsers: User[] = []) {
    const userRepository = new FakeUserRepository(initialUsers); // Create a fake user repository with optional initial users
    const sessionRepository = new FakeSessionRepository(); // Create a fake session repository
    const passwordHasher = new FakePasswordHasher(); // Create a fake password hasher
    const service = new AuthService( // Create an instance of AuthService with the fake repositories and hasher
        userRepository,
        sessionRepository,
        passwordHasher,
        new FakeSessionTokenGenerator(), // Create a fake session token generator
    );

    // Return the service and the fake repositories for use in tests
    return { service, userRepository, sessionRepository, passwordHasher };
}

test('register normalizes the email, hashes the password, and creates a session', async () => {
    // Create an AuthService instance with no initial users
    const { service, userRepository, passwordHasher, sessionRepository } = createService();

    // Call the register method with an email that has leading/trailing whitespace and uppercase letters
    const result = await service.register({
        email: '  PERSON@EXAMPLE.COM ',
        password: 'secret-password',
    });

    // Check that the email is normalized to lowercase and trimmed
    assert.equal(result.user.email, 'person@example.com'); 
    // Ensure that the passwordHash property is not present in the returned public user
    assert.equal('passwordHash' in result.user, false); 
    // Check that the password has been hashed
    assert.deepEqual(passwordHasher.hashedPasswords, ['secret-password']); 
    // Check that the session token is generated and stored in the session repository
    assert.equal(userRepository.createdData?.passwordHash, 'hashed:secret-password');
    // Check that the session repository has a session for the user with the hashed token
    assert.ok(sessionRepository.sessions.has('hashed-token:plain-session-token'));
});

test('register rejects an invalid email format', async () => {
    // The service should reject malformed emails before creating a user.
    const { service } = createService();

    await assert.rejects(
        service.register({ email: 'not-an-email', password: 'secret-password' }),
        InvalidEmailError,
    );
});

test('login rejects an incorrect password', async () => {
    // Create an AuthService instance with a FakeUserRepository containing a test user
    const { service } = createService([user]);

    // Call the login method with the correct email but an incorrect password
    await assert.rejects(
        service.login(user.email, 'wrong-password'),
        InvalidAuthCredentialsError,
    );
});

test('login rejects an invalid email format as invalid credentials', async () => {
    // Login uses a generic credentials error so it does not reveal account details.
    const { service } = createService();

    await assert.rejects(
        service.login('not-an-email', 'secret-password'),
        InvalidAuthCredentialsError,
    );
});

test('authenticate removes expired sessions and returns no user', async () => {
    // Expired sessions should be deleted and treated as unauthenticated.
    const { service, sessionRepository } = createService([user]);
    await sessionRepository.create(
        user.id,
        'hashed-token:expired-token',
        new Date(Date.now() - 1_000),
    );

    const result = await service.authenticate('expired-token');

    assert.equal(result, null);
    assert.deepEqual(sessionRepository.deletedSessionIds, [1]);
});
