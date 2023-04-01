import { MapSchema, Schema, ArraySchema, type } from "@colyseus/schema";
import { Client } from "colyseus";
import { HitRegister } from "./HitRegister";

export class Tuple extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class Projectile extends Schema {
  @type(Tuple) position: Tuple = new Tuple();
  @type(Tuple) velocity: Tuple = new Tuple();
}

export class Player extends Schema {
  @type(Tuple) position: Tuple = new Tuple();
  inputQueue: any[] = [];
  // @type([ Projectile ]) projectiles = new ArraySchema<Projectile>();
  client: Client;
  hitRegister: HitRegister
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>
}
