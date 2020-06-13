const { Database } = require("sqlite3");
const { promisify } = require("util");

export const new_db = () => new Database("db.sqlite");

export const run = (db) => promisify(db.run.bind(db));
export const get = (db) => promisify(db.get.bind(db));
export const all = (db) => promisify(db.all.bind(db));

export const setup_db = async (db) => {
  await run(db)("BEGIN TRANSACTION;");
  await run(db)(`
    DROP TABLE IF EXISTS meme;
  `);
  await run(db)(`
    DROP TABLE IF EXISTS meme_price;
  `);
  await run(db)(`
    DROP TABLE IF EXISTS session;
  `);
  await run(db)(`
    CREATE TABLE IF NOT EXISTS meme (
      id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
      name text NOT NULL,
      url text NOT NULL,
      price double NOT NULL
    );
  `);
  await run(db)(`
    CREATE TABLE IF NOT EXISTS meme_price (
      id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
      meme_id integer NOT NULL,
      price double NOT NULL,
      inserted_at date NOT NULL,

      FOREIGN KEY (meme_id) REFERENCES meme(id)
    );
  `);
  await run(db)(`
    CREATE TABLE IF NOT EXISTS session (
      sid text NOT NULL PRIMARY KEY,
      data text NOT NULL
    );
  `);
  await run(db)(`
    INSERT INTO meme (name, url, price)
    VALUES ('Gold', 'https://i.redd.it/h7rplf9jt8y21.png', 10000);
  `);
  await run(db)(`
    INSERT INTO meme (name, url, price)
    VALUES (
      'Platinum',
      'http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg',
      3000
    );
  `);
  await run(db)(`
    INSERT INTO meme (name, url, price)
    VALUES ('Elite', 'https://i.imgflip.com/30zz5g.jpg', 22000);
  `);
  await run(db)(`
    INSERT INTO meme (name, url, price)
    VALUES (
      'Sad reality',
      'http://www.shutupandtakemymoney.com/wp-content/uploads/2020/03/when-you-find-out-your-nomal-daily-lifestyle-is-called-quarantine-meme.jpg',
      1337
    );
  `);
  await run(db)("COMMIT TRANSACTION;");
};
