import { Meme } from "./meme";
import { User } from "./user";
import { new_db, setup_db } from "./db";
import store from "./session";

const cookie_parser = require("cookie-parser");
const csrf = require("csurf");
const body_parser = require("body-parser");
const express = require("express");
const session = require("express-session");
const DBStore = store(session);
const app = express();
const port = 8080;
const fifteen_minutes = 900000;

app.use(body_parser.urlencoded({ extended: false }));
app.use(cookie_parser());
app.use(csrf({ cookie: true }));
app.set("view engine", "pug");
app.use(express.static("static"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use((_req, res, next) => {
  res.locals.db = new_db();
  next();
});
app.use(
  session({
    secret: "a very insecure, hardcoded secret",
    cookie: { maxAge: fifteen_minutes },
    resave: false,
    saveUninitialized: true,
    store: new DBStore({ db: new_db() }),
  })
);
app.use((req, res, next) => {
  if (req.session.views) {
    req.session.views++;
  } else {
    req.session.views = 1;
  }
  res.locals.views = req.session.views;
  next();
});
app.use(async (req, res, next) => {
  res.locals.csrf_token = req.csrfToken();
  next();
});
app.use(async (req, res, next) => {
  if (req.session.user_id) {
    res.locals.user = await User.get_by_id(res.locals.db, req.session.user_id);
  }
  next();
});

app.get("/", async (_req, res) => {
  const memes = Meme.fetch_many_sorted_by_price(res.locals.db, 3);
  const top_meme = Meme.fetch(res.locals.db, 4);
  res.render("index", {
    ...res.locals,
    title: "Meme market",
    message: "Hello there!",
    memes: await memes,
    top_meme: await top_meme,
  });
});

app.get("/meme/:memeId", async (req, res) => {
  let meme = await Meme.fetch(res.locals.db, Number(req.params.memeId));
  if (meme !== null) {
    res.render("meme", {
      ...res.locals,
      meme: meme,
    });
  } else {
    res.render("meme-not-found", res.locals);
  }
});

app.post("/meme/:memeId", async (req, res) => {
  if (!res.locals.user) {
    res.redirect("/login");
    return;
  }
  let meme = await Meme.fetch(res.locals.db, Number(req.params.memeId));
  let price = Number(req.body.price);
  await meme.change_price(res.locals.db, res.locals.user.id, price);
  console.log(req.body.price);
  res.render("meme", {
    ...res.locals,
    meme: meme,
  });
});

app.get("/login", async (_req, res) => {
  res.render("login", {
    ...res.locals,
    login_failure: false,
  });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  var user;
  if (!username || !password) {
    user = null;
  } else {
    user = await User.get_by_username(res.locals.db, req.body.username);
  }
  if (user && user.password === password) {
    req.session.user_id = user.id;
    res.redirect("/");
  } else {
    res.render("login", {
      ...res.locals,
      login_failure: true,
    });
  }
});

app.post("/logout", async (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.listen(port, async () => {
  console.log("starting");
  const db = new_db();
  try {
    await setup_db(db);
  } catch (err) {
    console.log(err);
    console.log("quitting");
    process.exit(1);
  }
  console.log(`Server listening at http://localhost:${port}`);
});
