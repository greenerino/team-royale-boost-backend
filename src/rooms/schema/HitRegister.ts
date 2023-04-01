import { Player } from "./MyRoomState";

export class HitRegister {
  player: Player
  hits: Set<String>
  threshold: number
  callback: Function

  constructor(player: Player, threshold: number, callback: Function) {
    this.player = player
    this.hits = new Set()
    this.threshold = threshold
    this.callback = callback
  }

  setThreshold(n: number) {
    this.threshold = n
  }

  hit(shooterId: String, reporterId: String) {
    this.hits.add(reporterId)
    if (this.hits.size >= this.threshold) {
      this.callback(shooterId)
      this.hits.clear()
    }
  }
}
