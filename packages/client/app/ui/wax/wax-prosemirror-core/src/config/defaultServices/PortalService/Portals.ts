// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

export default class Portals {
  portals = []

  addPortal(portal) {
    this.portals.push(portal)
  }

  getPortals() {
    return this.portals
  }
}
