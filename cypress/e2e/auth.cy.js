const BASE_URL = 'http://localhost:3000';

describe('Authentication API', () => {
    const createdTokens = [];

    after(() => {
        createdTokens.forEach((token) => {
            cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/auth/me`,
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false
            });
        });
    });

    it('should register a new user successfully', () => {
        const testEmail = `test${Date.now()}@example.com`;
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'password123' }
        }).then((res) => {
            createdTokens.push(res.body.token);
            expect(res.status).to.eq(201);
            expect(res.body.message).to.include('Registered!');
            expect(res.body.token).to.be.a('string');
        });
    });

    it('should not register a user with duplicate email', () => {
        const testEmail = `duplicate${Date.now()}@example.com`;
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'password123' }
        }).then((res) => {
            createdTokens.push(res.body.token);
            expect(res.status).to.eq(201);
        });
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'password123' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(409);
            expect(res.body.message).to.include('already exists');
        });
    });

    it('should not register without required fields', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: 'test@example.com' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.include('required');
        });
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { password: 'password123' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.include('required');
        });
    });

    it('should login with valid credentials', () => {
        const testEmail = `login${Date.now()}@example.com`;
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'password123' }
        }).then((res) => {
            createdTokens.push(res.body.token);
        });
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/login`,
            body: { email: testEmail, password: 'password123' }
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.message).to.include('Login Successful');
            expect(res.body.token).to.be.a('string');
        });
    });

    it('should not login with invalid password', () => {
        const testEmail = `invalidpass${Date.now()}@example.com`;
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'correctPassword123' }
        }).then((res) => createdTokens.push(res.body.token));
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/login`,
            body: { email: testEmail, password: 'wrongPassword456' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(401);
            expect(res.body.message).to.include('Invalid Password');
        });
    });

    it('should not login with non-existent email', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/login`,
            body: { email: 'doesnotexist@example.com', password: 'password123' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(401);
            expect(res.body.message).to.include("doesn't exist");
        });
    });

    it('should not access protected route without token', () => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/auth/me`,
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(401);
            expect(res.body.message).to.include('No token provided');
        });
    });

    it('should access protected route with valid token', () => {
        const testEmail = `protected${Date.now()}@example.com`;
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/auth/register`,
            body: { email: testEmail, password: 'password123' }
        }).then((res) => {
            createdTokens.push(res.body.token);
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/auth/me`,
                headers: { Authorization: `Bearer ${res.body.token}` }
            }).then((meRes) => {
                expect(meRes.status).to.eq(200);
                expect(meRes.body.user).to.have.property('email', testEmail);
            });
        });
    });
});