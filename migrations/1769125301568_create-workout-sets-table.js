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
    pgm.createTable('workout_sets', {
        id: 'id',
        workout_id: {
            type: 'integer',
            notNull: true,
            references: 'workouts',
            onDelete: 'CASCADE'
        },
        exercise_id: {
            type: 'integer',
            notNull: true,
            references: 'exercises',
            onDelete: "RESTRICT"
        },
        set_number: {
            type: 'integer',
            notNull: true
        },
        reps: {
            type: 'integer',
            notNull: true
        },
        weight: {
            type: 'numeric(5, 1)',
            notNull: true
        },
        rpe: {
            type: 'integer',
            notNull: true,
            check: 'rpe >= 1 AND rpe <= 10'
        }
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('workout_sets');
};
