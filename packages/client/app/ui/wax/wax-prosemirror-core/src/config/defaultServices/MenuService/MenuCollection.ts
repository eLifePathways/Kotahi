// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/* eslint-disable no-unused-vars */

class MenuCollection {
  static inject = [{ all: 'Menu' }]

  menus = []
  constructor(menus) {
    this.menus = menus
  }

  getMenu(name) {
    return this.menus.find(menu => menu.name === name)
  }
}

export default MenuCollection
