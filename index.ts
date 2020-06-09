import { Meme, MemeAuction } from "./meme";

const express = require("express");
const app = express();
const port = 8080;

app.set("view engine", "pug");

const most_expensive = [
  {
    id: 10,
    name: "Gold",
    price: 1000,
    url: "https://i.redd.it/h7rplf9jt8y21.png",
  },
  {
    id: 9,
    name: "Platinum",
    price: 1100,
    url:
      "http://www.quickmeme.com/img/90/90d3d6f6d527a64001b79f4e13bc61912842d4a5876d17c1f011ee519d69b469.jpg",
  },
  {
    id: 8,
    name: "Elite",
    price: 1200,
    url: "https://i.imgflip.com/30zz5g.jpg",
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
    top_meme: new Meme(
      -1,
      1337,
      [1337],
      "Sad reality",
      "http://www.shutupandtakemymoney.com/wp-content/uploads/2020/03/when-you-find-out-your-nomal-daily-lifestyle-is-called-quarantine-meme.jpg"
    ),
  });
});

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
