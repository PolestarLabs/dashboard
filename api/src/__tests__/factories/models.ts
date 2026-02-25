// domain model factories for tests

export function makeUser(id: string, extras: Record<string, any> = {}) {
  return Object.assign({
    id,
    modules: {
      level: 1,
      exp: 0,
      commend: 0,
      RBN: 0,
      JDE: 0,
      SPH: 0,
      inventory: [],
      stickerInventory: [],
      medalInventory: [],
      bgInventory: [],
      bgID: null,
      sticker: null,
      favcolor: null,
      flairTop: null,
      persotext: null,
      tagline: null,
      medals: [],
    },
    donator: "",
    blacklisted: "",
  }, extras);
}

export function makeCosmetic(overrides: Partial<any> = {}) {
  return Object.assign({
    id: "cid",
    code: "ccode",
    icon: "cicon",
    type: "background",
    rarity: "R",
    tags: "",
    artistName: "artist",
    artistLink: "link",
    GROUP: "",
    BUNDLE: "",
    tradeable: false,
    droppable: false,
    destroyable: false,
    event: false,
    _id: { toString: () => "01234567" },
  }, overrides);
}
