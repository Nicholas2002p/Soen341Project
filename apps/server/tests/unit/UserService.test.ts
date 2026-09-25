import assert from 'node:assert/strict';
import test from 'node:test';
import { UserService } from '../../src/application/services/UserService.js';
import { UserRole } from '../../src/domain/entities/User.js';
import { FakeUserRepository, user } from '../fakes/AuthFakes.js';

test('getById returns a public user without the password hash', async () => {
    // Create a UserService instance with a FakeUserRepository containing a test user
    const service = new UserService(new FakeUserRepository([user]));

    // Call the getById method with the test user's ID
    const result = await service.getById(user.id);

    assert.equal(result?.id, user.id); // Check that the returned user's ID matches the test user's ID
    assert.equal(result?.email, user.email); // Check that the returned user's email matches the test user's email
    assert.equal(result?.role, user.role); // Check that the returned user's role matches the test user's role
    assert.equal('passwordHash' in (result ?? {}), false); // Ensure that the passwordHash property is not present in the returned public user
});

test('getByEmail returns null when no user matches', async () => {
    // Create a UserService instance with an empty FakeUserRepository
    const service = new UserService(new FakeUserRepository());

    // Call the getByEmail method with an email that does not exist in the repository
    const result = await service.getByEmail('missing@example.com');

    // Assert that the result is null, indicating that no user was found with the given email
    assert.equal(result, null);
});

test('updateRole returns the updated public user', async () => {
    // Create a UserService instance with a FakeUserRepository containing a test user
    const service = new UserService(new FakeUserRepository([user]));
    
    // Call the updateRole method with the test user's ID and a new role
    const result = await service.updateRole(user.id, UserRole.Recruiter);
    
    // Assert that the returned user has the updated role
    assert.equal(result?.role, UserRole.Recruiter);
    // Assert that the passwordHash property is not present in the returned public user
    assert.equal('passwordHash' in (result ?? {}), false);
});
