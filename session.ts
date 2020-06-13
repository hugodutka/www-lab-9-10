export default (session) => {
  const Store = session.Store;

  const noop = () => {};

  class DBStore extends Store {
    constructor(options: any = {}) {
      super(options);
      if (!options.db) {
        throw new Error("A db must be directly provided to the DBStore");
      }
      this.db = options.db;
    }

    get(sid, cb: Function = noop) {
      this.db.get(
        "SELECT data from session WHERE sid = ?;",
        sid,
        (err, rows) => {
          if (err) return cb(err);
          if (!rows) return cb();

          let result;
          try {
            result = JSON.parse(rows.data);
          } catch (err) {
            return cb(err);
          }
          return cb(null, result);
        }
      );
    }

    set(sid, sess, cb: Function = noop) {
      let value;
      try {
        value = JSON.stringify(sess);
      } catch (err) {
        return cb(err);
      }
      this.db.run(
        "REPLACE INTO session (sid, data) VALUES (?, ?);",
        sid,
        value,
        cb
      );
    }

    destroy(sid, cb = noop) {
      this.db.run("DELETE FROM session WHERE sid = ?;", sid, cb);
    }
  }

  return DBStore;
};
