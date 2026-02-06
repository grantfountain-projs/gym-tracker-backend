describe('Workout API', () => {
    it('should create a new workout', () => {
      cy.loginAndGetToken().then((token) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:3000/workouts',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: {
            date: '2026-02-03',
            notes: 'Test workout'
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('message');
          expect(response.body).to.have.property('workout');
          expect(response.body.workout.date).to.include('2026-02-03');
          expect(response.body.workout).to.have.property('notes', 'Test workout');
        });
      });
    });
    
    it('should create a few workouts and get all workouts', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-03',
              notes: 'Test workout 1'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
          });
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-04',
              notes: 'Test workout 2'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
          });
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-05',
              notes: 'Test workout 3'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
          });
          cy.request({
            method: 'GET',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.workouts).to.be.an('Array');
            expect(response.body.message).to.include('successfully retrieved');

          });
        });
    });

    it('should retrieve a workout by its id', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-05',
              notes: 'Test workout'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            const workoutId = response.body.workout.id;
            cy.request({
                method: 'GET',
                url: `http://localhost:3000/workouts/${workoutId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.workout.date).to.include('2026-02-05');
                expect(response.body.workout.notes).to.include('Test workout');
              });
          });
        });
    });

    it('should update a workout by its id', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-05',
              notes: 'Test workout'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            const workoutId = response.body.workout.id;
            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/workouts/${workoutId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: {
                  date: '2026-02-14',
                  notes: 'Updated Test workout'
                }
              }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.workout.date).to.include('2026-02-14');
                expect(response.body.workout.notes).to.include('Updated Test workout');
              });
          });
        });
    });

    it('should delete a workout by its id', () => {
        cy.loginAndGetToken().then((token) => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/workouts',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: {
              date: '2026-02-05',
              notes: 'Test workout'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            const workoutId = response.body.workout.id;
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3000/workouts/${workoutId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.message).to.include('deleted successfully');
            });
            cy.request({
                method: 'GET',
                url: `http://localhost:3000/workouts/${workoutId}`,
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                failOnStatusCode: false
              }).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body.message).to.include('Workout not found');
            });
          });
        });
    });
      
});