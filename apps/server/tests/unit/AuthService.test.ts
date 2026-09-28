import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthService } from '../../src/application/services/AuthService.js';
import type { User } from '../../src/domain/entities/User.js';
import { InvalidAuthCredentialsError } from '../../src/domain/errors/InvalidAuthCredentialsError.js';
import { InvalidEmailError } from '../../src/domain/errors/InvalidEmailError.js';
import {
    FakePasswordHasher,
    FakeSaltRepository,
    FakeSessionRepository,
    FakeSessionTokenGenerator,
    FakeUserRepository,
    FakeGoogleTokenVerifier,
    user,
} from '../fakes/AuthFakes.js';

console.log('\n=== tests/unit/AuthService.test.ts ===');

function createService(initialUsers: User[] = []) {
    const userRepository = new FakeUserRepository(initialUsers); // Create a fake user repository with optional initial users
    const sessionRepository = new FakeSessionRepository(); // Create a fake session repository
    const passwordHasher = new FakePasswordHasher(); // Create a fake password hasher
    const saltRepository = new FakeSaltRepository();
    const googleTokenVerifier = new FakeGoogleTokenVerifier({
        'new-user-token': { email: '  New.User@Gmail.com ' },
        'existing-user-token': { email: user.email },
    });
    const service = new AuthService( // Create an instance of AuthService with the fake repositories and hasher
        userRepository,
        sessionRepository,
        passwordHasher,
        new FakeSessionTokenGenerator(), // Create a fake session token generator
        saltRepository,
        googleTokenVerifier,
    );

    // Return the service and the fake repositories for use in tests
    return { service, userRepository, sessionRepository, passwordHasher, saltRepository };
}

test('register normalizes the email, hashes the password, and creates a session', async () => {
    // Create an AuthService instance with no initial users
    const { service, userRepository, passwordHasher, sessionRepository, saltRepository } = createService();

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
    assert.equal(userRepository.createdData?.passwordHash, 'hashed:secret-password:salt:10');
    assert.equal(saltRepository.salts.get(result.user.id), 'salt:10');
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

test('login upgrades a password hash below the current salt rounds', async () => {
    const lowRoundUser = { ...user, passwordHash: 'low-rounds-hash' };
    const { service, userRepository, saltRepository } = createService([lowRoundUser]);
    saltRepository.salts.set(lowRoundUser.id, 'salt:8');

    const result = await service.login(lowRoundUser.email, 'secret-password');
    const updatedUser = await userRepository.getByEmail(lowRoundUser.email);

    assert.equal(updatedUser?.passwordHash, 'hashed:secret-password:salt:10');
    assert.equal(saltRepository.salts.get(lowRoundUser.id), 'salt:10');
    assert.equal(result.user.id, lowRoundUser.id);
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

test('loginWithGoogle creates a user and a session on first Google login', async () => {
    const { service, userRepository, sessionRepository } = createService();

    const result = await service.loginWithGoogle('new-user-token');

    // The Google email is normalized and the password hash is never exposed
    assert.equal(result.user.email, 'new.user@gmail.com');
    assert.equal('passwordHash' in result.user, false);
    // A new user was created and a session was stored
    assert.ok(userRepository.createdData);
    assert.ok(sessionRepository.sessions.has('hashed-token:plain-session-token'));
});

test('loginWithGoogle logs in an existing user without creating a new account', async () => {
    const { service, userRepository } = createService([user]);

    const result = await service.loginWithGoogle('existing-user-token');

    assert.equal(result.user.id, user.id);
    assert.ok(!userRepository.createdData);
});

test('loginWithGoogle rejects an invalid Google token', async () => {
    const { service } = createService();

    await assert.rejects(
        service.loginWithGoogle('fake-token'),
        { name: 'InvalidGoogleTokenError' },
    );
});