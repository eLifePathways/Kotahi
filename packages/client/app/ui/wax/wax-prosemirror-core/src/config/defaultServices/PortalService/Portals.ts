// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { injectable } from 'inversify'

@injectable()
export default class Portals {
  portals = []

  addPortal(portal) {
    this.portals.push(portal)
  }

  getPortals() {
    return this.portals
  }
}
