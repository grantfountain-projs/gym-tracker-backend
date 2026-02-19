const BASE_URL = 'http://localhost:3000';

// Creates a fresh user and returns { token, email }
Cypress.Commands.add('createTestUser', () => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/auth/register`,
        body: { email, password: 'password123' }
    }).then((res) => ({
        token: res.body.token,
        email
    }));
});

// Deletes the user — cascades to workouts and sets
Cypress.Commands.add('deleteTestUser', (token) => {
    return cy.request({
        method: 'DELETE',
        url: `${BASE_URL}/auth/me`,
        headers: { Authorization: `Bearer ${token}` }
    });
});

// Kept for backwards compat but now just wraps createTestUser
Cypress.Commands.add('loginAndGetToken', () => {
    return cy.createTestUser().then(({ token }) => token);
});

Cypress.Commands.add('createWorkoutWithToken', (token) => {
    return cy.request({
        method: 'POST',
        url: `${BASE_URL}/workouts`,
        headers: { Authorization: `Bearer ${token}` },
        body: { date: '2026-02-03', notes: 'Test workout' }
    }).then((res) => res.body.workout.id);
});