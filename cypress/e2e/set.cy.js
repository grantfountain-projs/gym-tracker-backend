// set.cy.js
const BASE_URL = 'http://localhost:3000';

describe('Set API', () => {
    let tokenA, tokenB;

    before(() => {
        cy.createTestUser().then((user) => { tokenA = user.token; });
        cy.createTestUser().then((user) => { tokenB = user.token; });
    });

    after(() => {
        cy.deleteTestUser(tokenA);
        cy.deleteTestUser(tokenB);
    });

    it('should create a set for a workout', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenA}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            }).then((res) => {
                expect(res.status).to.eq(201);
                expect(res.body.set.reps).to.eq(10);
                expect(res.body.set.rpe).to.eq(7);
            });
        });
    });

    it('should get all sets for a workout', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            [1, 2, 3].forEach((setNum) => {
                cy.request({
                    method: 'POST',
                    url: `${BASE_URL}/workouts/${workoutId}/sets`,
                    headers: { Authorization: `Bearer ${tokenA}` },
                    body: { exercise_id: 1, set_number: setNum, reps: 10, weight: 185.5, rpe: setNum + 6 }
                });
            });
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenA}` }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.sets).to.have.length(3);
                expect(res.body.sets[0].exercise_name).to.eq('Bench Press');
            });
        });
    });

    it('should update a set', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenA}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            }).then((res) => {
                const setId = res.body.set.id;
                cy.request({
                    method: 'PUT',
                    url: `${BASE_URL}/workouts/sets/${setId}`,
                    headers: { Authorization: `Bearer ${tokenA}` },
                    body: { exercise_id: 2, set_number: 1, reps: 8, weight: 155.0, rpe: 8 }
                }).then((updateRes) => {
                    expect(updateRes.status).to.eq(200);
                    expect(updateRes.body.set.reps).to.eq(8);
                    expect(updateRes.body.set.weight).to.eq('155.0');
                });
            });
        });
    });

    it('should delete a set', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenA}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            }).then((res) => {
                const setId = res.body.set.id;
                cy.request({
                    method: 'DELETE',
                    url: `${BASE_URL}/workouts/sets/${setId}`,
                    headers: { Authorization: `Bearer ${tokenA}` }
                }).then((deleteRes) => {
                    expect(deleteRes.status).to.eq(200);
                    expect(deleteRes.body.message).to.include('Successfully deleted set');
                });
            });
        });
    });

    it('should fail to delete a non-existent set', () => {
        cy.request({
            method: 'DELETE',
            url: `${BASE_URL}/workouts/sets/0`,
            headers: { Authorization: `Bearer ${tokenA}` },
            failOnStatusCode: false
        }).then((res) => {
            expect(res.status).to.eq(403);
            expect(res.body.message).to.include('Set not found or unauthorized');
        });
    });

    it('should not create set for another user\'s workout', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenB}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(403);
                expect(res.body.message).to.include('unauthorized');
            });
        });
    });

    it('should not update another user\'s set', () => {
        cy.createWorkoutWithToken(tokenA).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${tokenA}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            }).then((res) => {
                const setId = res.body.set.id;
                cy.request({
                    method: 'PUT',
                    url: `${BASE_URL}/workouts/sets/${setId}`,
                    headers: { Authorization: `Bearer ${tokenB}` },
                    body: { exercise_id: 2, set_number: 1, reps: 5, weight: 200, rpe: 9 },
                    failOnStatusCode: false
                }).then((res) => {
                    expect(res.status).to.eq(403);
                    expect(res.body.message).to.include('unauthorized');
                });
            });
        });
    });
});