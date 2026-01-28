/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createIndex('exercises', 'LOWER(name)', {
        unique: true,
        name: 'exercises_name_lower_unique'
    });

    pgm.addConstraint('exercises', 'valid_muscle_group', {
        check: `muscle_group IN ('Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Forearms', 'Cardio', 'Full Body')`
    });

    pgm.sql(`
        INSERT INTO exercises (name, muscle_group) VALUES
      -- Chest exercises
      ('Bench Press', 'Chest'),
      ('Incline Bench Press', 'Chest'),
      ('Dumbbell Fly', 'Chest'),
      ('Push-ups', 'Chest'),
      
      -- Back exercises
      ('Pull-ups', 'Back'),
      ('Barbell Row', 'Back'),
      ('Lat Pulldown', 'Back'),
      ('Deadlift', 'Back'),
      ('Seated Cable Row', 'Back'),
      
      -- Leg exercises
      ('Squat', 'Legs'),
      ('Front Squat', 'Legs'),
      ('Leg Press', 'Legs'),
      ('Lunges', 'Legs'),
      ('Leg Curl', 'Legs'),
      ('Calf Raises', 'Legs'),
      
      -- Shoulder exercises
      ('Overhead Press', 'Shoulders'),
      ('Lateral Raise', 'Shoulders'),
      ('Front Raise', 'Shoulders'),
      ('Face Pulls', 'Shoulders'),
      
      -- Bicep exercises
      ('Barbell Curl', 'Biceps'),
      ('Hammer Curl', 'Biceps'),
      ('Preacher Curl', 'Biceps'),
      
      -- Tricep exercises
      ('Tricep Dips', 'Triceps'),
      ('Skull Crushers', 'Triceps'),
      ('Overhead Tricep Extension', 'Triceps'),
      
      -- Core exercises
      ('Plank', 'Core'),
      ('Crunches', 'Core'),
      ('Russian Twist', 'Core'),
      
      -- Forearm exercises
      ('Wrist Curls', 'Forearms'),
      ('Farmer''s Walk', 'Forearms'),
      
      -- Cardio exercises
      ('Running', 'Cardio'),
      ('Cycling', 'Cardio'),
      ('Rowing', 'Cardio'),
      
      -- Full Body exercises
      ('Burpees', 'Full Body'),
      ('Thrusters', 'Full Body')
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.sql(`DELETE FROM exercises`);
    pgm.dropConstraint('exercises', 'valid_muscle_group');
    pgm.dropIndex('exercises', 'LOWER(name)', { name: 'exercises_name_lower_unique' });
};
