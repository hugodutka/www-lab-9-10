import { sealed } from "./helpers";
import { get } from "./db";

@sealed
export class User {
  constructor(
    public id: number,
    public username: string,
    public password: string
  ) {}

  static async get_by_id(db, id: number): Promise<User | null> {
    const fields = await get(db)("SELECT * FROM user WHERE id = ?;", id);
    if (!fields) return null;
    return new User(fields.id, fields.username, fields.password);
  }

  static async get_by_username(db, username: string): Promise<User | null> {
    const fields = await get(db)(
      "SELECT * FROM user WHERE username = ?;",
      username
    );
    if (!fields) return null;
    return new User(fields.id, fields.username, fields.password);
  }
}
