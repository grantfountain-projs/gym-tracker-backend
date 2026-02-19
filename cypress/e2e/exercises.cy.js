// exercise.cy.js
const BASE_URL = 'http://localhost:3000';

describe('Exercise API', () => {
    let token;
    const createdExerciseIds = [];

    before(() => {
        cy.createTestUser().then((user) => { token = user.token; });
    });

    after(() => {
        // Delete any exercises created during tests
        createdExerciseIds.forEach((id) => {
            cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/exercises/${id}`,
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false
            });
        });
        cy.deleteTestUser(token);
    });

    it('should get all exercises', () => {
        cy.request({ method: 'GET', url: `${BASE_URL}/exercises` }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.exercises).to.be.an('array');
            expect(res.body.exercises.length).to.be.greaterThan(34);
        });
    });

    it('should get exercise by id', () => {
        cy.request({ method: 'GET', url: `${BASE_URL}/exercises/1` }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.exercise.name).to.eq('Bench Press');
            expect(res.body.exercise.muscle_group).to.eq('Chest');
        });
    });

    it('should create a new exercise', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/exercises`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: `Test Exercise ${Date.now()}`, muscle_group: 'Legs' }
        }).then((res) => {
            expect(res.status).to.eq(201);
            createdExerciseIds.push(res.body.exercise.id);
            expect(res.body.exercise.muscle_group).to.eq('Legs');
        });
    });

    it('should fail to create a duplicate exercise', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/exercises`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: 'Bench Press', muscle_group: 'Chest' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(409);
            expect(res.body.message).to.include('Exercise with this name already exists');
        });
    });

    it('should fail to create an exercise with invalid muscle group', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/exercises`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: `Test Exercise ${Date.now()}`, muscle_group: 'Fake Muscle Group' },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(400);
            expect(res.body.message).to.include('Invalid muscle group');
        });
    });

    it('should update an exercise', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/exercises`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: `Test Exercise ${Date.now()}`, muscle_group: 'Legs' }
        }).then((res) => {
            const id = res.body.exercise.id;
            createdExerciseIds.push(id);
            cy.request({
                method: 'PUT',
                url: `${BASE_URL}/exercises/${id}`,
                headers: { Authorization: `Bearer ${token}` },
                body: { name: `Updated Exercise ${Date.now()}`, muscle_group: 'Core' }
            }).then((updateRes) => {
                expect(updateRes.status).to.eq(200);
                expect(updateRes.body.exercise.muscle_group).to.eq('Core');
            });
        });
    });

    it('should delete an exercise', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/exercises`,
            headers: { Authorization: `Bearer ${token}` },
            body: { name: `Test Exercise ${Date.now()}`, muscle_group: 'Legs' }
        }).then((res) => {
            const id = res.body.exercise.id;
            cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/exercises/${id}`,
                headers: { Authorization: `Bearer ${token}` }
            }).then((deleteRes) => {
                expect(deleteRes.status).to.eq(200);
                expect(deleteRes.body.message).to.include('Exercise successfully deleted');
            });
        });
    });

    it('should fail to delete an exercise used in a set', () => {
        cy.request({
            method: 'DELETE',
            url: `${BASE_URL}/exercises/1`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(409);
            expect(res.body.message).to.include('Cannot delete exercise - it is used in existing workouts');
        });
    });

    it('should fail to get an exercise that does not exist', () => {
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/exercises/0`,
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(404);
            expect(res.body.message).to.include('Exercise not found');
        });
    });
});