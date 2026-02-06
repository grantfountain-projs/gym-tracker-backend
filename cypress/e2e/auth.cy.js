describe('Authentication API', () => {
  it('should register a new user successfully', () => {
    // Generate unique email using timestamp
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;


    // Make POST request to /auth/register
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: 'password123'
      }
    }).then((response) => {
      // Assert status code is 201 Created
      expect(response.status).to.eq(201);

      // Assert response has success message
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('Registered!');

      // Assert we got a token back
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string');
    });
  });
  it('should not register a user with duplicate email', () => {
    const timestamp = Date.now();
    const testEmail = `duplicate${timestamp}@example.com`;
    
    // First registration - should succeed
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: 'password123'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
    });
    
    // Second registration with same email - should fail
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: 'password123'
      },
      failOnStatusCode: false  // Prevents Cypress from failing on 4xx/5xx
    }).then((response) => {
      expect(response.status).to.eq(409);
      expect(response.body.message).to.include('already exists');
    });
  });
  it('should not register without required fields', () => {
    // Missing password
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: 'test@example.com'
        // password missing
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('required');
    });
    
    // Missing email
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        password: 'password123'
        // email missing
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message).to.include('required');
    });
  });
  it('should login with valid credentials', () => {
    const timestamp = Date.now();
    const testEmail = `login${timestamp}@example.com`;
    const testPassword = 'password123';
    
    // Register a user
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: testPassword
      }
    });
    
    // Login with those credentials
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/login',
      body: {
        email: testEmail,
        password: testPassword
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.message).to.include('Login Successful');
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string');
    });
  });
  it('should not login with invalid password', () => {
    const timestamp = Date.now();
    const testEmail = `invalidpass${timestamp}@example.com`;
    
    // Register user
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: 'correctPassword123'
      }
    });
    
    // Try to login with wrong password
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/login',
      body: {
        email: testEmail,
        password: 'wrongPassword456'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.include('Invalid Password');
    });
  });
  it('should not login with non-existent email', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/login',
      body: {
        email: 'doesnotexist@example.com',
        password: 'password123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.include("doesn't exist");
    });
  });
  it('should not access protected route without token', () => {
    cy.request({
      method: 'GET',
      url: 'http://localhost:3000/auth/me',
      failOnStatusCode: false
    }).then((response) => {
      console.log('Response body:', response.body);
      expect(response.status).to.eq(401);
      expect(response.body.message).to.include('No token provided');
    });
  });
  it('should access protected route with valid token', () => {
    const timestamp = Date.now();
    const testEmail = `protected${timestamp}@example.com`;
    
    // Register and get token
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/auth/register',
      body: {
        email: testEmail,
        password: 'password123'
      }
    }).then((registerResponse) => {
      const token = registerResponse.body.token;
      
      // Use token to access protected route
      cy.request({
        method: 'GET',
        url: 'http://localhost:3000/auth/me',
        headers: {
          'Authorization': `Bearer ${token}`  // Adding token to header
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('email', testEmail);
      });
    });
  });
});