exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(120)', notNull: true },
    email: { type: 'varchar(180)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    role: { type: 'varchar(30)', notNull: true, default: 'user' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('companies', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(160)', notNull: true },
    location: { type: 'varchar(160)', notNull: true },
    description: { type: 'text' },
    created_by: { type: 'varchar(50)', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('categories', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(120)', notNull: true },
    created_by: { type: 'varchar(50)', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('jobs', {
    id: { type: 'varchar(50)', primaryKey: true },
    company_id: { type: 'varchar(50)', notNull: true, references: 'companies(id)', onDelete: 'CASCADE' },
    category_id: { type: 'varchar(50)', notNull: true, references: 'categories(id)', onDelete: 'CASCADE' },
    title: { type: 'varchar(180)', notNull: true },
    description: { type: 'text' },
    job_type: { type: 'varchar(50)' },
    experience_level: { type: 'varchar(50)' },
    location_type: { type: 'varchar(50)' },
    location_city: { type: 'varchar(120)' },
    salary_min: { type: 'bigint' },
    salary_max: { type: 'bigint' },
    is_salary_visible: { type: 'boolean', notNull: true, default: false },
    status: { type: 'varchar(30)', notNull: true, default: 'open' },
    created_by: { type: 'varchar(50)', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createTable('applications', {
    id: { type: 'varchar(50)', primaryKey: true },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    job_id: { type: 'varchar(50)', notNull: true, references: 'jobs(id)', onDelete: 'CASCADE' },
    status: { type: 'varchar(30)', notNull: true, default: 'pending' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.addConstraint('applications', 'applications_user_job_unique', { unique: ['user_id', 'job_id'] });

  pgm.createTable('bookmarks', {
    id: { type: 'varchar(50)', primaryKey: true },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    job_id: { type: 'varchar(50)', notNull: true, references: 'jobs(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.addConstraint('bookmarks', 'bookmarks_user_job_unique', { unique: ['user_id', 'job_id'] });

  pgm.createTable('authentications', {
    token: { type: 'text', primaryKey: true },
    user_id: { type: 'varchar(50)', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createIndex('jobs', 'company_id');
  pgm.createIndex('jobs', 'category_id');
  pgm.createIndex('applications', 'user_id');
  pgm.createIndex('applications', 'job_id');
  pgm.createIndex('bookmarks', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('authentications');
  pgm.dropTable('bookmarks');
  pgm.dropTable('applications');
  pgm.dropTable('jobs');
  pgm.dropTable('categories');
  pgm.dropTable('companies');
  pgm.dropTable('users');
};
