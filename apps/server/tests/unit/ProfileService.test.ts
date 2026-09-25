import assert from 'node:assert/strict';
import test from 'node:test';
import type { ProfileData } from '../../src/application/interfaces/repositories/IProfileRepository.js';
import { ProfileService } from '../../src/application/services/ProfileService.js';
import { FakeProfileRepository, profile } from '../fakes/ProfileFakes.js';

console.log('\n=== tests/unit/ProfileService.test.ts ===');

test('getByUserId delegates to the profile repository', async () => {
    const repository = new FakeProfileRepository(profile);
    const service = new ProfileService(repository);

    // Call the service method to get a profile by userId
    const result = await service.getByUserId(profile.userId);

    // Assert that the result matches the expected profile and that the repository was called with the correct userId
    assert.deepEqual(result, profile);
    assert.equal(repository.requestedUserId, profile.userId);
});

test('getByUserId returns null when the repository has no profile', async () => {
    const repository = new FakeProfileRepository();
    const service = new ProfileService(repository);

    // Call the service method to get a profile by userId when no profile exists
    const result = await service.getByUserId(profile.userId);

    // Assert that the result is null and that the repository was called with the correct userId
    assert.equal(result, null);
    assert.equal(repository.requestedUserId, profile.userId);
});

test('getPublicByUserId excludes the phone number', async () => {
    const repository = new FakeProfileRepository(profile);
    const service = new ProfileService(repository);

    const result = await service.getPublicByUserId(profile.userId);

    assert.deepEqual(result, {
        userId: profile.userId,
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        bio: profile.bio,
        location: profile.location,
        profileURL: profile.profileURL,
    });
    assert.equal('phone' in (result ?? {}), false);
});

test('update delegates the user id and profile data to upsert', async () => {
    // Create a fake repository and service for testing the update method
    const repository = new FakeProfileRepository();
    const service = new ProfileService(repository);
    const data: ProfileData = {
        firstName: 'Grace',
        lastName: 'Hopper',
        bio: 'Computer scientist',
    };

    // Call the service method to update a profile with a specific userId and data
    const result = await service.update(12, data);

    // Assert that the repository's upsert method was called with the correct userId and data, and that the result matches the expected profile
    assert.equal(repository.upsertedUserId, 12);
    assert.deepEqual(repository.upsertedData, data);
    assert.equal(result.userId, 12);
    assert.equal(result.firstName, 'Grace');
});