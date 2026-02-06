describe('Set API', () => {
    it('should create a set for a workout', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {
                // test the set creation
                cy.request({
                method: 'POST',
                url: `http://localhost:3000/workouts/${workoutId}/sets`,
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                }
                }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('message');
                expect(response.body).to.have.property('set');
                expect(response.body.message).to.include('Successfully created new set');
                expect(response.body.set.exercise_id).to.eq(1);
                expect(response.body.set.set_number).to.eq(1);
                expect(response.body.set.reps).to.eq(10);
                expect(response.body.set.weight).to.include(185.5);
                expect(response.body.set.rpe).to.eq(7);
                });
            });
        });
    });
    
    it('should get all sets for a workout', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {
                cy.request({
                  method: 'POST',
                  url: `http://localhost:3000/workouts/${workoutId}/sets`,
                  headers: { 'Authorization': `Bearer ${token}` },
                  body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                  }
                }).then((response) => {
                  expect(response.status).to.eq(201);
                });
                cy.request({
                    method: 'POST',
                    url: `http://localhost:3000/workouts/${workoutId}/sets`,
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: {
                      exercise_id: 1,
                      set_number: 2,
                      reps: 10,
                      weight: 185.5,
                      rpe: 8
                    }
                  }).then((response) => {
                    expect(response.status).to.eq(201);
                });
                cy.request({
                    method: 'POST',
                    url: `http://localhost:3000/workouts/${workoutId}/sets`,
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: {
                      exercise_id: 1,
                      set_number: 3,
                      reps: 10,
                      weight: 185.5,
                      rpe: 10
                    }
                  }).then((response) => {
                    expect(response.status).to.eq(201);
                });
                cy.request({
                    method: 'GET',
                    url: `http://localhost:3000/workouts/${workoutId}/sets`,
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message');
                    expect(response.body).to.have.property('sets');
                    expect(response.body.message).to.include('Successfully retrieved all sets');
                    expect(response.body.sets).to.be.an('array');
                    expect(response.body.sets.length).to.eq(3);
                    expect(response.body.sets[0].exercise_name).to.include('Bench Press');
                    expect(response.body.sets[0]).to.have.property('reps', 10);
                    expect(response.body.sets[0]).to.have.property('weight', '185.5');
                    expect(response.body.sets[0]).to.have.property('rpe', 7);
                    expect(response.body.sets[0]).to.have.property('exercise_name', 'Bench Press');
                    expect(response.body.sets[0]).to.have.property('muscle_group', 'Chest');
                });

            });
        });
    });

    it('should update a set', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {

                cy.request({
                method: 'POST',
                url: `http://localhost:3000/workouts/${workoutId}/sets`,
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                }
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    const setId = response.body.set.id;
                    cy.request({
                        method: 'PUT',
                        url: `http://localhost:3000/workouts/sets/${setId}`,
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: {
                            exercise_id: 2,
                            set_number: 1,
                            reps: 8,
                            weight: 155.0,
                            rpe: 8
                        }
                        }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.set).to.have.property('reps', 8);
                        expect(response.body.set).to.have.property('weight', '155.0');
                        expect(response.body.set).to.have.property('rpe', 8);
                        expect(response.body.set).to.have.property('exercise_id', 2);
                        expect(response.body.set).to.have.property('set_number', 1);
                    });
                });
                
            });
        });
    });

    it('should delete a set', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {

                cy.request({
                method: 'POST',
                url: `http://localhost:3000/workouts/${workoutId}/sets`,
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                }
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    const setId = response.body.set.id;
                    cy.request({
                        method: 'DELETE',
                        url: `http://localhost:3000/workouts/sets/${setId}`,
                        headers: { 'Authorization': `Bearer ${token}` }
                        }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message');
                        expect(response.body.message).to.include('Successfully deleted set');
                    });
                });
                
            });
        });
    });

    it('should fail to delete a set where set id is not found', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {

                cy.request({
                method: 'POST',
                url: `http://localhost:3000/workouts/${workoutId}/sets`,
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                }
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    const setId = 0;
                    cy.request({
                        method: 'DELETE',
                        url: `http://localhost:3000/workouts/sets/${setId}`,
                        headers: { 'Authorization': `Bearer ${token}` },
                        failOnStatusCode: false
                        }).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message');
                        expect(response.body.message).to.include('Set not found or unauthorized');
                    });
                });
                
            });
        });
    });

    it('should fail to delete a non-existent set', () => {
        cy.loginAndGetToken().then((token) => {
            cy.createWorkoutWithToken(token).then((workoutId) => {
                const setId = 0;
                cy.request({
                    method: 'DELETE',
                    url: `http://localhost:3000/workouts/sets/${setId}`,
                    headers: { 'Authorization': `Bearer ${token}` },
                    failOnStatusCode: false
                    }).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message');
                    expect(response.body.message).to.include('Set not found or unauthorized');
                    
                });
            });
        });
    });

    it('should not create set for another user\'s workout', () => {
        // User A creates workout
        cy.loginAndGetToken().then((tokenA) => {
            cy.createWorkoutWithToken(tokenA).then((workoutIdFromUserA) => {
                
                // User B tries to add set to User A's workout
                cy.loginAndGetToken().then((tokenB) => {
                    cy.request({
                        method: 'POST',
                        url: `http://localhost:3000/workouts/${workoutIdFromUserA}/sets`,
                        headers: { 'Authorization': `Bearer ${tokenB}` },  // Using User B's token
                        body: {
                        exercise_id: 1,
                        set_number: 1,
                        reps: 10,
                        weight: 185.5,
                        rpe: 7
                        },
                        failOnStatusCode: false
                    }).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body.message).to.include('unauthorized');
                    });
                });
                
            });
        });
    });

    it('should not update another user\'s set', () => {
        // User A tries to create workout and set
        cy.loginAndGetToken().then((tokenA) => {
            cy.createWorkoutWithToken(tokenA).then((workoutId) => {
                
                // User A creates a set
                cy.request({
                method: 'POST',
                url: `http://localhost:3000/workouts/${workoutId}/sets`,
                headers: { 'Authorization': `Bearer ${tokenA}` },
                body: {
                    exercise_id: 1,
                    set_number: 1,
                    reps: 10,
                    weight: 185.5,
                    rpe: 7
                }
                }).then((setResponse) => {
                const setIdFromUserA = setResponse.body.set.id;
                
                // User B tries to update User A's set
                    cy.loginAndGetToken().then((tokenB) => {
                        cy.request({
                        method: 'PUT',
                        url: `http://localhost:3000/workouts/sets/${setIdFromUserA}`,
                        headers: { 'Authorization': `Bearer ${tokenB}` },  // Using User B's token
                        body: {
                            exercise_id: 2,
                            set_number: 1,
                            reps: 5,
                            weight: 200,
                            rpe: 9
                        },
                        failOnStatusCode: false
                        }).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body.message).to.include('unauthorized');
                        });
                    });
                
                });
            });
        });
    });
});