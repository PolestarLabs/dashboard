// domain model factories for tests

export function makeUser(id: string, extras: Record<string, any> = {}) {
  return Object.assign({
    id,
    progression: {
      level: 1,
      exp: 0,
    },
    currency: {
      RBN: 0,
      JDE: 0,
      SPH: 0,
    },
    counters: {
      commend: 0,
    },
    profile: {
      bgID: null,
      sticker: null,
      favcolor: null,
      flairTop: null,
      persotext: null,
      tagline: null,
      medals: [],
    },
    prime: {},
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
