import { sealed } from "./helpers";

@sealed
export class Meme {
  msg: string;

  constructor(msg: string) {
    this.msg = msg;
  }

  getMsg(): string {
    return this.msg;
  }

  setMsg(msg: string): void {
    this.msg = msg;
  }
}
