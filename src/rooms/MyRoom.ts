import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage(0, (client, data) => {
      const player = this.state.players.get(client.sessionId)
      const velocity = 2;

      if (data.left) {
        player.x -= velocity;
      } else if (data.right) {
        player.x += velocity;
      }

      if (data.up) {
        player.y -= velocity;
      } else if (data.down) {
        player.y += velocity;
      }
    })
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playAreaWidth = 800
    const playAreaHeight = 600

    const player = new Player()
    player.x = (Math.random() * playAreaWidth)
    player.y = (Math.random() * playAreaHeight)

    this.state.players.set(client.sessionId, player)
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
