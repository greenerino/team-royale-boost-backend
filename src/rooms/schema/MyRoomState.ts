import { MapSchema, Schema, type } from "@colyseus/schema";

export class Tuple extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

export class Projectile extends Schema {
  @type(Tuple) position: Tuple;
  @type(Tuple) velocity: Tuple;
}

export class Player extends Schema {
  @type(Tuple) position: Tuple = new Tuple();
  inputQueue: any[] = [];
  @type([ Projectile ]) projectiles: Projectile[] = [];
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>
}
