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
    pgm.createTable('users', {  // Table name
        id: 'id',  // Shorthand for serial primary key
        email: {
          type: 'varchar(255)',
          notNull: true,
          unique: true
        },
        password_hash: {
          type: 'text',
          notNull: true
        },
        created_at: {
          type: 'timestamp',
          notNull: true,
          default: pgm.func('NOW()')
        }
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('users');
};
