const fs = require('fs');

const required = [
  '.env.example',
  'ERD-OpenJob-versi-1.png',
  'src/database/migrations/1788525000670_create-openjob-schema.js',
  'src/database/migrations/1788525000671_create-documents-table.js',
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }
}

console.log('Required submission files are present.');
