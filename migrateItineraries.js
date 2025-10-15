// migrateItineraries.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Update this path to your actual database file
const dbPath = path.resolve(__dirname, 't365backend/t65sql.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log('Starting migration of itineraries...');

  // 0. Drop previous backup if it exists
  db.run('DROP TABLE IF EXISTS itineraries_old', (err) => {
    if (err) {
      console.error('Error dropping old backup table:', err);
      return;
    }

    // 1. Rename current table
    db.run('ALTER TABLE itineraries RENAME TO itineraries_old', (err) => {
      if (err) {
        console.error('Error renaming table:', err);
        return;
      }

      // 2. Create new table with owner_id as TEXT
      db.run(
        `CREATE TABLE itineraries (
          itinerary_id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id TEXT NOT NULL,
          title TEXT
        )`,
        (err) => {
          if (err) {
            console.error('Error creating new table:', err);
            return;
          }

          // 3. Copy data from old table
          db.run(
            `INSERT INTO itineraries (itinerary_id, owner_id, title)
             SELECT itinerary_id, CAST(owner_id AS TEXT), title
             FROM itineraries_old`,
            (err) => {
              if (err) {
                console.error('Error copying data:', err);
                return;
              }

              console.log('Data copied successfully!');

              // 4. Drop old backup table
              db.run('DROP TABLE itineraries_old', (err) => {
                if (err) {
                  console.error('Error dropping old backup table:', err);
                  return;
                }

                console.log('Old table dropped. Migration complete!');
                db.close();
              });
            }
          );
        }
      );
    });
  });
});
