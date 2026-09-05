exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'varchar(50)', primaryKey: true },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    filename: { type: 'varchar(255)', notNull: true, unique: true },
    original_name: { type: 'varchar(255)', notNull: true },
    mime_type: { type: 'varchar(100)', notNull: true },
    size: { type: 'bigint', notNull: true },
    path: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.createIndex('documents', 'user_id');
};

exports.down = (pgm) => pgm.dropTable('documents');
