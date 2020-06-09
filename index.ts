import { Meme, MemeAuction } from "./meme";

const express = require("express");
const app = express();
const port = 8080;

app.set("view engine", "pug");

app.use(
  express.urlencoded({
    extended: true,
  })
);

const most_expensive = [
  {
    id: 10,
    name: "Gold",
    price: 10000,
    url: "https://i.redd.it/h7rplf9jt8y21.png",
  },
  {
    id: 9,
    name: "Platinum",
    price: 11000,
    url:
      "http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg",
  },
  {
    id: 8,
    name: "Elite",
    price: 12000,
    url: "https://i.imgflip.com/30zz5g.jpg",
  },
  {
    id: 69,
    name: "Sad reality",
    price: 1337,
    url:
      "http://www.shutupandtakemymoney.com/wp-content/uploads/2020/03/when-you-find-out-your-nomal-daily-lifestyle-is-called-quarantine-meme.jpg",
  },
];

const auction = new MemeAuction();
for (const { id, name, price, url } of most_expensive) {
  auction.add_meme(new Meme(id, price, [price], name, url));
}

app.get("/", (req, res) => {
  res.render("index", {
    title: "Meme market",
    message: "Hello there!",
    memes: auction.list_three_priciest_memes(),
    top_meme: auction.get_meme(69),
  });
});

app.get("/meme/:memeId", function (req, res) {
  let meme = auction.get_meme(Number(req.params.memeId));
  if (meme !== null) {
    res.render("meme", { meme: meme });
  } else {
    res.render("meme-not-found");
  }
});

app.post("/meme/:memeId", function (req, res) {
  let meme = auction.get_meme(Number(req.params.memeId));
  let price = Number(req.body.price);
  meme.change_price(price);
  console.log(req.body.price);
  res.render("meme", { meme: meme });
});

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
