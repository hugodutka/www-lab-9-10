import { sealed } from "./helpers";

@sealed
export class Meme {
  constructor(
    public id: number,
    public price: number,
    public price_history: Array<number>,
    public name: string,
    public url: string
  ) {}

  change_price(price: number): void {
    this.price_history.push(this.price);
    this.price = price;
  }
}

@sealed
export class MemeAuction {
  constructor(private memes = new Map<number, Meme>()) {}

  add_meme(meme: Meme): void {
    this.memes.set(meme.id, meme);
  }

  get_meme(id: number): Meme | null {
    return this.memes.has(id) ? this.memes.get(id) : null;
  }

  list_all_memes(): Meme[] {
    return Array.from(this.memes.values());
  }

  list_three_priciest_memes(): Meme[] {
    return Array.from(this.memes.values())
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
  }
}
