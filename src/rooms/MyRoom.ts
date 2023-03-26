import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage(0, (client, data) => {
      const player = this.state.players.get(client.sessionId)

      player.inputQueue.push(data)
    })

    let elapsedTime = 0
    this.setSimulationInterval((delta) => {
      elapsedTime += delta
      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep
        this.fixedTick(this.fixedTimeStep)
      }
    })
  }

  fixedTick(delta: number) {
    const velocity = 6

    this.state.players.forEach(player => {
      let input: any

      while (input = player.inputQueue.shift()) {
        if (input.left) {
            player.x -= velocity;
        } else if (input.right) {
            player.x += velocity;
        }

        if (input.up) {
            player.y -= velocity;
        } else if (input.down) {
            player.y += velocity;
        }
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
