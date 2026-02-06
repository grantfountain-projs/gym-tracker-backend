describe('exercise API', () => {
    it('should get all exercises', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/exercises'
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.include('Successfully retrieved all exercises');
            expect(response.body.exercises).to.be.an('array');
            expect(response.body.exercises.length).to.be.greaterThan(34);
        });
    });

    it('should get exercise by id', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/exercises/1'
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('exercise');
            expect(response.body.message).to.include('Successfully retrieved exercise');
            expect(response.body.exercise).to.have.property('name');
            expect(response.body.exercise).to.have.property('muscle_group');
            expect(response.body.exercise.name).to.include('Bench Press');
            expect(response.body.exercise.muscle_group).to.include('Chest');
        });
    });
    
    it('should create a new exercise', () => {
        cy.loginAndGetToken().then((token) => {
          const timestamp = Date.now();
          const exerciseName = `Test Exercise ${timestamp}`;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/exercises',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: exerciseName,
              muscle_group: 'Legs'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message');
            expect(response.body).to.have.property('exercise');
            expect(response.body.exercise.name).to.include(exerciseName);
            expect(response.body.exercise).to.have.property('muscle_group', 'Legs');
          });
        });
    });
      
    it('should fail to create a duplicate exercise', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/exercises',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: 'Bench Press',
              muscle_group: 'Chest'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.include('Exercise with this name already exists')
          });
        });
    });

    it('should fail to create an exercise with invalid muscle group', () => {
        cy.loginAndGetToken().then((token) => {
          const timestamp = Date.now();
          const exerciseName = `Test Exercise ${timestamp}`;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/exercises',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: exerciseName,
              muscle_group: 'Fake Muscle Group'
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.include('Invalid muscle group')
          });
        });
    });

    it('should update an exercise', () => {
        cy.loginAndGetToken().then((token) => {
          const timestamp = Date.now();
          const exerciseName = `Test Exercise ${timestamp}`;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/exercises',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: exerciseName,
              muscle_group: 'Legs'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            const exerciseId = response.body.exercise.id;
            const newTimestamp = Date.now();
            const newExerciseName = `Test Exercise ${newTimestamp}`;
            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/exercises/${exerciseId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: {
                  name: newExerciseName,
                  muscle_group: 'Core'
                }
              }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.exercise.name).to.include(newExerciseName);
                expect(response.body.exercise.muscle_group).to.include('Core');
              });
          });
        });
    });

    it('should delete an exercise', () => {
        cy.loginAndGetToken().then((token) => {
          const timestamp = Date.now();
          const exerciseName = `Test Exercise ${timestamp}`;
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/exercises',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              name: exerciseName,
              muscle_group: 'Legs'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            const exerciseId = response.body.exercise.id;
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3000/exercises/${exerciseId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message');
                expect(response.body.message).to.include('Exercise successfully deleted');
              });
          });
        });
    });

    it('should fail to delete an exercise used in a set', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'DELETE',
            url: 'http://localhost:3000/exercises/1',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(409);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.include('Cannot delete exercise - it is used in existing workouts');
            
          });
        });
    });

    it('should fail to get an exercise that does not exist', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/exercises/0',
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property('message');
            expect(response.body.message).to.include('Exercise not found');
            
        });
    });
});