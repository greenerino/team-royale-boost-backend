import { Room, Client } from "colyseus";
import { HitRegister } from "./schema/HitRegister";
import { MyRoomState, Player } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  fixedTimeStep = 1000 / 60
  projectileDamage = 8

  onCreate (options: any) {
    this.setState(new MyRoomState());

    this.onMessage('playerInput', (client, data) => {
      const player = this.state.players.get(client.sessionId)

      player.inputQueue.push(data)
    })

    this.onMessage('hit', (reporterClient, data) => {
      const { shooterId, victimId } = data
      const reporterId = reporterClient.sessionId
      const victim = this.state.players.get(victimId)
      // TODO: move to fixedTick()
      victim.hitRegister.hit(shooterId, reporterId)
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
    player.health = 100
    player.spriteFrameKey = "adam_front.png"

    player.client = client
    player.hitRegister = new HitRegister(player, 0, (shooterId: string) => {
      player.health -= this.projectileDamage
    })

    this.state.players.set(client.sessionId, player)
    this.updateHitRegisterThresholds()
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    this.state.players.delete(client.sessionId)
    this.updateHitRegisterThresholds()
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  updateHitRegisterThresholds() {
    const threshold = (this.state.players.size / 2) + 1
    this.state.players.forEach((player) => {
      player.hitRegister.setThreshold(threshold)
    })
  }

}
