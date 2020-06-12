import { Meme } from "./meme";
import { new_db, setup_db } from "./db";

const cookie_parser = require("cookie-parser");
const csrf = require("csurf");
const body_parser = require("body-parser");
const express = require("express");
const app = express();
const port = 8080;

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

app.get("/", async (_req, res) => {
  const memes = Meme.fetch_many_sorted_by_price(res.locals.db, 3);
  const top_meme = Meme.fetch(res.locals.db, 4);
  res.render("index", {
    title: "Meme market",
    message: "Hello there!",
    memes: await memes,
    top_meme: await top_meme,
  });
});

app.get("/meme/:memeId", async (req, res) => {
  let meme = await Meme.fetch(res.locals.db, Number(req.params.memeId));
  if (meme !== null) {
    res.render("meme", { meme: meme, csrf_token: req.csrfToken() });
  } else {
    res.render("meme-not-found");
  }
});

app.post("/meme/:memeId", async (req, res) => {
  let meme = await Meme.fetch(res.locals.db, Number(req.params.memeId));
  let price = Number(req.body.price);
  await meme.change_price(res.locals.db, price);
  console.log(req.body.price);
  res.render("meme", { meme: meme, csrf_token: req.csrfToken() });
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
