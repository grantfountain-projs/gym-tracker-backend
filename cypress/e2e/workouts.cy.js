// workout.cy.js
const BASE_URL = 'http://localhost:3000';

describe('Workout API', () => {
    let token;

    before(() => {
        cy.createTestUser().then((user) => { token = user.token; });
    });

    after(() => {
        cy.deleteTestUser(token);
    });

    it('should create a new workout', () => {
        cy.request({
            method: 'POST',
            url: `${BASE_URL}/workouts`,
            headers: { Authorization: `Bearer ${token}` },
            body: { date: '2026-02-03', notes: 'Test workout' }
        }).then((res) => {
            expect(res.status).to.eq(201);
            expect(res.body.workout.date).to.include('2026-02-03');
            expect(res.body.workout.notes).to.eq('Test workout');
        });
    });

    it('should create a few workouts and get all workouts', () => {
        ['2026-02-03', '2026-02-04', '2026-02-05'].forEach((date, i) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts`,
                headers: { Authorization: `Bearer ${token}` },
                body: { date, notes: `Test workout ${i + 1}` }
            }).then((res) => expect(res.status).to.eq(201));
        });
        cy.request({
            method: 'GET',
            url: `${BASE_URL}/workouts`,
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body.workouts).to.be.an('Array');
            expect(res.body.message).to.include('successfully retrieved');
        });
    });

    it('should retrieve a workout by its id', () => {
        cy.createWorkoutWithToken(token).then((workoutId) => {
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/workouts/${workoutId}`,
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.workout.notes).to.include('Test workout');
            });
        });
    });

    it('should update a workout by its id', () => {
        cy.createWorkoutWithToken(token).then((workoutId) => {
            cy.request({
                method: 'PUT',
                url: `${BASE_URL}/workouts/${workoutId}`,
                headers: { Authorization: `Bearer ${token}` },
                body: { date: '2026-02-14', notes: 'Updated Test workout' }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.workout.date).to.include('2026-02-14');
                expect(res.body.workout.notes).to.include('Updated Test workout');
            });
        });
    });

    it('should delete a workout by its id', () => {
        cy.createWorkoutWithToken(token).then((workoutId) => {
            cy.request({
                method: 'DELETE',
                url: `${BASE_URL}/workouts/${workoutId}`,
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.message).to.include('deleted successfully');
            });
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/workouts/${workoutId}`,
                headers: { Authorization: `Bearer ${token}` },
                failOnStatusCode: false
            }).then((res) => {
                expect(res.status).to.eq(404);
            });
        });
    });

    it('should get workout history with exercises and sets', () => {
        cy.createWorkoutWithToken(token).then((workoutId) => {
            // Add a set so the workout appears in history
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${token}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            });
    
            // Mark workout complete
            cy.request({
                method: 'PUT',
                url: `${BASE_URL}/workouts/${workoutId}`,
                headers: { Authorization: `Bearer ${token}` },
                body: { date: '2026-02-03', notes: 'Test workout', completed_at: new Date().toISOString() }
            });
    
            // Fetch history and verify structure
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/workouts/history`,
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                expect(res.status).to.eq(200);
                expect(res.body.history).to.be.an('array');
                expect(res.body.history.length).to.be.greaterThan(0);
    
                const workout = res.body.history[0];
                expect(workout).to.have.property('id');
                expect(workout).to.have.property('completed_at');
                expect(workout.exercises).to.be.an('array');
                expect(workout.exercises.length).to.be.greaterThan(0);
    
                const exercise = workout.exercises[0];
                expect(exercise).to.have.property('name');
                expect(exercise).to.have.property('muscle_group');
                expect(exercise.sets).to.be.an('array');
                expect(exercise.sets.length).to.be.greaterThan(0);
    
                const set = exercise.sets[0];
                expect(set).to.have.property('reps', 10);
                expect(set).to.have.property('weight', '185.5');
                expect(set).to.have.property('rpe', 7);
            });
        });
    });
  
    it('should not return incomplete workouts in history', () => {
        cy.createWorkoutWithToken(token).then((workoutId) => {
            cy.request({
                method: 'POST',
                url: `${BASE_URL}/workouts/${workoutId}/sets`,
                headers: { Authorization: `Bearer ${token}` },
                body: { exercise_id: 1, set_number: 1, reps: 10, weight: 185.5, rpe: 7 }
            });
    
            // Do NOT mark as complete
            cy.request({
                method: 'GET',
                url: `${BASE_URL}/workouts/history`,
                headers: { Authorization: `Bearer ${token}` }
            }).then((res) => {
                const ids = res.body.history.map((w) => w.id);
                expect(ids).to.not.include(workoutId);
            });
        });
    });
});