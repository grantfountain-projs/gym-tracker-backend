// Custom command to register a user and return their auth token
Cypress.Commands.add('loginAndGetToken', () => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testPassword = 'password123';
    
    return cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: testPassword
      }
    }).then((response) => {
      return response.body.token;
    });
});

// Create a workout and return its ID
Cypress.Commands.add('createWorkoutWithToken', (token) => {
    const timestamp = Date.now();
    return cy.request({
      method: 'POST',
      url: 'http://localhost:3000/workouts',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        date: '2026-02-03',
        notes: `Test workout ${timestamp}`
      }
    }).then((response) => {
      return response.body.workout.id;
    });
});