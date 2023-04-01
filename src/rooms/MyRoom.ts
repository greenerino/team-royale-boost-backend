import { Room, Client } from "colyseus";
import { MyRoomState, Player, Projectile, Tuple } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage('playerInput', (client, data) => {
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

  fixedTick(_delta: number) {
    this.state.players.forEach(player => {
      let input: any

      while (input = player.inputQueue.shift()) {
        player.position.x = input.position.x
        player.position.y = input.position.y
        player.spriteFrameKey = input.spriteFrameKey

        if (input.shoot.active) {
          this.shoot(player, input.shoot.x, input.shoot.y)
        }
      }
    })
  }

  shoot(player: Player, x: number, y: number) {
    const payload = {
      playerId: player.client.sessionId,
      position: {
        x: player.position.x,
        y: player.position.y,
      },
      velocity: {
        x,
        y,
      },
    }
    this.broadcast('shoot', payload, { except: player.client })
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playAreaWidth = 800
    const playAreaHeight = 600

    const player = new Player()
    player.position.x = (Math.random() * playAreaWidth)
    player.position.y = (Math.random() * playAreaHeight)
    player.spriteFrameKey = "adam_front.png"

    player.client = client

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
