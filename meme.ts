import { sealed } from "./helpers";
import { run, get, all } from "./db";

@sealed
export class Meme {
  constructor(
    public id: number,
    public price: number,
    public price_history: Array<number>,
    public name: string,
    public url: string
  ) {}

  async change_price(db, user_id: number, price: number): Promise<void> {
    await run(db)("BEGIN TRANSACTION;");
    await run(db)(
      "INSERT INTO meme_price (meme_id, user_id, price, inserted_at) VALUES (?, ?, ?, ?)",
      this.id,
      user_id,
      this.price,
      Date.now()
    );
    await run(db)("UPDATE meme SET price = ? WHERE id = ?;", price, this.id);
    await run(db)("COMMIT TRANSACTION;");
    this.price_history.unshift(this.price);
    this.price = price;
  }

  async save(db) {
    await run(db)(
      "INSERT OR REPLACE INTO meme (id, name, url, price) VALUES (?, ?, ?, ?);",
      this.id,
      this.name,
      this.url,
      this.price
    );
  }

  static async fetch(db, id: number): Promise<Meme | null> {
    const meme_promise = get(db)("SELECT * FROM meme WHERE id = ?;", id);
    const prices_promise = all(db)(
      "SELECT * FROM meme_price WHERE meme_id = ? ORDER BY inserted_at DESC;",
      id
    );
    const meme_fields = await meme_promise;
    if (typeof meme_fields === "undefined") return null;
    return new Meme(
      meme_fields.id,
      meme_fields.price,
      (await prices_promise).map(({ price }) => price),
      meme_fields.name,
      meme_fields.url
    );
  }

  // Returns at most `limit` most expensive memes sorted by price descending.
  // If `limit` is set to `0`, fetches all memes.
  static async fetch_many_sorted_by_price(
    db,
    limit: number = 0
  ): Promise<Meme[]> {
    await run(db)("BEGIN TRANSACTION;");
    const ids =
      limit > 0
        ? await all(db)(
            `SELECT id FROM meme
            ORDER BY price DESC
            LIMIT ?;`,
            limit
          )
        : await all(db)("SELECT id FROM meme ORDER BY price DESC;");

    const memes: Meme[] = await Promise.all(
      ids.map(({ id }) => Meme.fetch(db, id))
    );

    await run(db)("COMMIT TRANSACTION");
    return memes;
  }
}
