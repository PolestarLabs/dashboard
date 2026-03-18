import type { BackgroundOption } from './BackgroundPicker/BackgroundPicker.vue';
import type { MedalItem } from './MedalPicker/MedalPicker.vue';
import type { PackOption, StickerOption } from './StickerSelect/StickerSelect.vue'; export const sampleUserProfile = {
  id: '88120564400553984',
  profile: {
    medals: ['opc2', 'chao', 'norway', 'finalfantasyvii', 'mew', 'pacman_inky', 'cytusneko', 'xmastree', 'finland'],
  },
} as const; export const sampleBackgrounds: BackgroundOption[] = [
  {
    id: 'brazil218',
    code: '624f8cb0131927cde08c9317592db0dd',
    name: 'Brazil by 大馬場十三 - World Cup',
    rarity: 'SR',
    tags: 'world cup soccer fifa gijinka',
    ownedIndex: 0,
    releaseIndex: 1000,
    rarIndex: 3,
    img: 'https://cdn.pollux.gg/backdrops/624f8cb0131927cde08c9317592db0dd.png',
    value: '624f8cb0131927cde08c9317592db0dd',
    label: 'Brazil by 大馬場十三 - World Cup',
  },
  {
    id: 'costarica218',
    code: 'f76d61d70fcd63f6022af7576cbd4064',
    name: 'Costa Rica by 大馬場十三 - World Cup',
    rarity: 'R',
    tags: 'world cup soccer fifa gijinka',
    ownedIndex: 1,
    releaseIndex: 2000,
    rarIndex: 2,
    img: 'https://cdn.pollux.gg/backdrops/f76d61d70fcd63f6022af7576cbd4064.png',
    value: 'f76d61d70fcd63f6022af7576cbd4064',
    label: 'Costa Rica by 大馬場十三 - World Cup',
  },
  {
    id: 'germany218',
    code: 'd54b7396f047812769fbb31f41636457',
    name: 'Germany by 大馬場十三 - World Cup',
    rarity: 'SR',
    tags: 'world cup soccer fifa gijinka',
    ownedIndex: 2,
    releaseIndex: 3000,
    rarIndex: 3,
    img: 'https://cdn.pollux.gg/backdrops/d54b7396f047812769fbb31f41636457.png',
    value: 'd54b7396f047812769fbb31f41636457',
    label: 'Germany by 大馬場十三 - World Cup',
  },
  {
    id: 'russia218',
    code: '48e32f99615bde59225e1277985c01b8',
    name: 'Russia by 大馬場十三 - World Cup',
    rarity: 'UR',
    tags: 'world cup soccer fifa gijinka',
    ownedIndex: 3,
    releaseIndex: 4000,
    rarIndex: 4,
    img: 'https://cdn.pollux.gg/backdrops/48e32f99615bde59225e1277985c01b8.png',
    value: '48e32f99615bde59225e1277985c01b8',
    label: 'Russia by 大馬場十三 - World Cup',
  },
]; export const sampleStickers: StickerOption[] = [
  { id: 'porupix', name: 'Pollux Pixel', series_id: 'plx18', rarity: 'XR', value: 'porupix', label: 'Pollux Pixel' },
  { id: 'porubarcode', name: 'Pollux Barcode', series_id: 'plx18', rarity: 'XR', value: 'porubarcode', label: 'Pollux Barcode' },
  { id: 'daianpanmercy', name: 'Mercy by Daianpan', series_id: 'daianwatch', rarity: 'UR', value: 'daianpanmercy', label: 'Mercy by Daianpan' },
  { id: 'daianpanzenyatta', name: 'Zennyata by Daianpan', series_id: 'daianwatch', rarity: 'C', value: 'daianpanzenyatta', label: 'Zennyata by Daianpan' },
  { id: 'cecystick', name: 'Cecily Sticker', series_id: 'events', rarity: 'UR', value: 'cecystick', label: 'Cecily Sticker' },
  { id: 'austristick', name: 'Australis Sticker', series_id: 'events', rarity: 'SR', value: 'austristick', label: 'Australis Sticker' },
]; export const sampleStickerPacks: PackOption[] = [
  {
    id: 'plx18_booster',
    code: 'bpk_PLX18',
    icon: 'plx18',
    name: 'Pollux Special Collection 2018',
    rarity: 'XR',
    size: 2,
    droppable: false,
    value: 'plx18_booster',
    label: 'Pollux Special Collection 2018',
  },
  {
    id: 'daianwatch_booster',
    code: 'bpk_DWT',
    icon: 'daianwatch',
    name: 'Overwatch by Daianpan',
    rarity: 'SR',
    size: 2,
    droppable: false,
    value: 'daianwatch_booster',
    label: 'Overwatch by Daianpan',
  },
  {
    id: 'events_booster',
    code: 'bpk_events',
    icon: 'events',
    name: 'Solstice Event 2018',
    rarity: 'UR',
    size: 2,
    droppable: true,
    value: 'events_booster',
    label: 'Solstice Event 2018',
  },
]; export const sampleMedals: MedalItem[] = [
  {
    "name": "Beachy Ball",
    "icon": "beachball18",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Crabby",
    "icon": "crabby",
    "category": "animals",
    "tags": "event solstice summer",
    "rarity": "U",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Dolphin Splash",
    "icon": "dolphin",
    "category": "animals",
    "tags": "event solstice summer",
    "rarity": "R",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Ice Cream Pot",
    "icon": "icecream2",
    "category": "food",
    "tags": "event solstice summer",
    "rarity": "SR",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Parasol",
    "icon": "parasol",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Rubber Ring",
    "icon": "rubbering",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "U",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Snorkel",
    "icon": "snorkel",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Sonne",
    "icon": "sonne",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Squirt Gun",
    "icon": "watergun",
    "category": "things",
    "tags": "event solstice summer",
    "rarity": "R",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Cecily",
    "icon": "ceciround",
    "category": "mascots",
    "tags": "event solstice summer",
    "rarity": "UR",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "FLW",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Beanie",
    "icon": "beanie",
    "category": "things",
    "tags": "event solstice winter",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Coffee",
    "icon": "coffee",
    "category": "food",
    "tags": "event solstice winter",
    "rarity": "R",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Pengu",
    "icon": "pengu",
    "category": "animals",
    "tags": "event solstice winter",
    "rarity": "U",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Snowglobe",
    "icon": "snowglobe",
    "category": "things",
    "tags": "event solstice winter",
    "rarity": "U",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Snowman",
    "icon": "snowman",
    "category": "things",
    "tags": "event solstice winter",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Southpole",
    "icon": "southpole",
    "category": "things",
    "tags": "event solstice winter",
    "rarity": "R",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Cocoa",
    "icon": "cocoa",
    "category": "food",
    "tags": "event solstice winter",
    "rarity": "SR",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Leaves",
    "icon": "leaves",
    "category": "things",
    "tags": "event solstice winter",
    "rarity": "C",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Nikoliny",
    "icon": "nikyround",
    "category": "mascots",
    "tags": "event solstice winter",
    "rarity": "UR",
    "event": "solstice18",
    "howto": "Part of Solstice 2018 Event", "filter": "SFK",

    "meta": {
      "legacy": true
    }
  },
  {
    "name": "ATARI",
    "icon": "atari",
    "category": "games",
    "tags": "console atari oldschool",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "SEGA",
    "icon": "sega",
    "category": "games",
    "tags": "console games brands sega oldschool",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "F35 Lightning II - Joint Strike Fighter",
    "icon": "f35jointstrike",
    "category": "things",
    "tags": "aviation military badge",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Yamaha",
    "icon": "yamaha",
    "category": "brands",
    "tags": "logo automobile music",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "UFP Starfleet",
    "icon": "starfleet",
    "category": "TV",
    "tags": "tv series star_trek",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Tesla Motors",
    "icon": "teslamotors",
    "category": "Brands",
    "tags": "automobile logo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Clockwork Collector",
    "icon": "10daily",
    "category": "Achievements",
    "tags": "pollux meta achievements",
    "rarity": "U",
    "howto": "Get 10 Dailies",
    "public": false,
    "BUNDLE": "achievs",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Task Force 108 : Warwolf",
    "icon": "warwolfsquad",
    "category": "games",
    "tags": "game ace_combat assault_horizon",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Bones",
    "icon": "pweenmedal1-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Dracula",
    "icon": "pweenmedal7-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Pierced Heart",
    "icon": "pweenmedal5-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "U",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Pumpkin",
    "icon": "pweenmedal2-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Broom",
    "icon": "pweenmedal9-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Vamplips",
    "icon": "pweenmedal8-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Blackat",
    "icon": "pweenmedal14-byramywafaa",
    "category": "event",
    "tags": "event halloween",
    "rarity": "C",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Dracula's Castle",
    "icon": "pweenmedal26",
    "category": "event",
    "tags": "event halloween",
    "rarity": "U",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Pumpkin",
    "icon": "pweenmedal27",
    "category": "event",
    "tags": "event halloween",
    "rarity": "U",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Treatbag",
    "icon": "pweenmedal30",
    "category": "event",
    "tags": "event halloween",
    "rarity": "R",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Noctix",
    "icon": "pweennox",
    "category": "event",
    "tags": "event halloween",
    "rarity": "UR",
    "event": "halloween18",
    "howto": "", "BUNDLE": "Halloween 18",

    "meta": {
      "legacy": true
    },
    "filter": "halloween"
  },
  {
    "name": "Beyblade",
    "icon": "beyblade",
    "category": "anime",
    "tags": "",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Brazil Flag",
    "icon": "brazil",
    "category": "flags",
    "tags": "south america",
    "rarity": "C", "event": null
  },
  {
    "name": "Burger",
    "icon": "burger",
    "category": "food",
    "tags": "fast-food",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Counter Strike",
    "icon": "counterstrike",
    "category": "games",
    "tags": "fps csgo",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Dark Magician Girl",
    "icon": "darkmagirl",
    "category": "pins",
    "tags": "yu-gi-oh yugioh",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Fruki Guaraná",
    "icon": "fruki",
    "category": "food",
    "tags": "soda brazil",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Gardevoir",
    "icon": "gardevoir",
    "category": "pokemon",
    "tags": "",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Germany Flag",
    "icon": "germany",
    "category": "flags",
    "tags": "europe",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Hatsune Miku",
    "icon": "miku",
    "category": "anime",
    "tags": "vocaloid",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Heroes of the Storm",
    "icon": "heroes",
    "category": "games",
    "tags": "moba blizzard",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Hylian Shield",
    "icon": "hyruleshield",
    "category": "games",
    "tags": "rpg nintendo zelda",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Japan Flag",
    "icon": "japan",
    "category": "flags",
    "tags": "asia",
    "rarity": "SR", "event": null
  },
  {
    "name": "League of Legends",
    "icon": "league",
    "category": "games",
    "tags": "moba",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Nintendo 3DS",
    "icon": "n3ds",
    "category": "games",
    "tags": "console nintendo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Overwatch",
    "icon": "overwatch",
    "category": "games",
    "tags": "fps blizzard",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Patreon",
    "icon": "patreon",
    "category": "exclusive",
    "howto": "Become a Patron with 1$ or more at %site% ~",
    "tags": "brands",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pikachu",
    "icon": "pikachu",
    "category": "pokemon",
    "tags": "",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pokéball",
    "icon": "pokeball",
    "category": "pokemon",
    "tags": "icons",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pollux Mansion",
    "icon": "pollux",
    "category": "exclusive",
    "howto": "Be an active member at Pollux's official Server~",
    "tags": "",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Portugal Flag",
    "icon": "portugal",
    "category": "flags",
    "tags": "europe",
    "rarity": "C", "event": null
  },
  {
    "name": "StarCraft II",
    "icon": "starcraft",
    "category": "games",
    "tags": "rts blizzard",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Super Nintendo",
    "icon": "snes",
    "category": "games",
    "tags": "console nintendo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Twitch.tv",
    "icon": "twitch",
    "category": "brands",
    "tags": "sites",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Umbreon",
    "icon": "umbreon",
    "category": "pokemon",
    "tags": "",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "WoW: Alliance",
    "icon": "alliancewow",
    "category": "games",
    "tags": "alliance warcraft",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Adobe",
    "icon": "adobe",
    "category": "brands",
    "tags": "software design",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Argentina Flag",
    "icon": "argentina",
    "category": "flags",
    "tags": "south_america",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Canada Flag",
    "icon": "canada",
    "category": "flags",
    "tags": "north_america",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Czech Republic Flag",
    "icon": "czech",
    "category": "flags",
    "tags": "europe central_europe",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "D.Va Bunny",
    "icon": "dva_logo",
    "category": "games",
    "tags": "overwatch",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Firefox",
    "icon": "firefox",
    "category": "brands",
    "tags": "software browser",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "WoW: Horde",
    "icon": "hordewow",
    "category": "games",
    "tags": "warcraft horde",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "World of Warcraft",
    "icon": "wow",
    "category": "games",
    "tags": "mmo",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Venezuela Flag",
    "icon": "venezuela",
    "category": "flags",
    "tags": "south_america",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "United Kingdom Flag",
    "icon": "ukingdom",
    "category": "flags",
    "tags": "not_europe britain",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Ubuntu",
    "icon": "ubuntu",
    "category": "brands",
    "tags": "software os system",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Steam",
    "icon": "steam",
    "category": "brands",
    "tags": "software service",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "SNES Buttons",
    "icon": "snesround",
    "category": "games",
    "tags": "nintendo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Piece of Ham",
    "icon": "schink",
    "category": "food",
    "tags": "meat",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "American Flag",
    "icon": "murica",
    "category": "flags",
    "tags": "north_america",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Romania Flag",
    "icon": "romania",
    "category": "flags",
    "tags": "europe eastern_europe",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Malaysia Flag",
    "icon": "malay",
    "category": "flags",
    "tags": "asia south_asia",
    "rarity": "U", "event": null
  },
  {
    "name": "Italy Flag",
    "icon": "italy",
    "category": "flags",
    "tags": "europe mediterranean",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "France Flag",
    "icon": "france",
    "category": "flags",
    "tags": "europe west",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Chibi Pumpkin ",
    "icon": "chibipumpkin",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Black Cat",
    "icon": "blackat",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Chibi Spider",
    "icon": "chibispider",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Who you're gonna call",
    "icon": "gbusters",
    "category": "movies",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Ghostling",
    "icon": "ghostling",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Pollux Halloween 2017",
    "icon": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "category": "event",
    "event": "halloween_2017",
    "tags": "halloween event",
    "rarity": "XR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Jack Skellington Pin",
    "icon": "jackskell1",
    "category": "movies",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Pentagram",
    "icon": "pentagram",
    "category": "symbols",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Your Ordinary Pumpkin",
    "icon": "pumpkin",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Yet Another Pumpkin",
    "icon": "pumpkin2",
    "category": "event",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Soul Eater Shinigami",
    "icon": "shinigami_sl_eater",
    "category": "anime",
    "event": "halloween_2017",
    "howto": "Get it by collecting candies or from Event Lootboxes. More info at the<a href='http://pollux.fun/events/halloween'>Halloween Event Page</a>",
    "tags": "halloween event",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Finland Flag",
    "icon": "finland",
    "category": "flags",
    "tags": "europe nordic",
    "rarity": "SR", "event": null
  },
  {
    "name": "Flag of USSR",
    "icon": "ussr",
    "category": "flags",
    "tags": "eurasia asia europe soviet",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Norway Flag",
    "icon": "norway",
    "category": "flags",
    "tags": "europe nordic",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "BMW Logo",
    "icon": "bmw",
    "category": "brands",
    "tags": "automobile",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "DareDevil",
    "icon": "daredev",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Naruto: Leaf",
    "icon": "narutoleaf",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mitsubishi",
    "icon": "mitsu",
    "category": "brands",
    "tags": "automobile",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mercedes Logo",
    "icon": "mercedes",
    "category": "brands",
    "tags": "automobile",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Fairy Tail",
    "icon": "ftail",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "One Piece 1",
    "icon": "opc1",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "One Piece 2",
    "icon": "opc2",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Volkswagen",
    "icon": "volks",
    "category": "brands",
    "tags": "automobile",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Soul Eater",
    "icon": "seater",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Dragon Ball Z - Goku",
    "icon": "gokudbz",
    "category": "anime",
    "tags": "anime icon symbol logo",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Windows Setup",
    "icon": "winstall",
    "category": "icons",
    "tags": "software os system",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "The Coco Froot",
    "icon": "cocofroot",
    "category": "misc",
    "tags": "pollux random",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Coca Cola",
    "icon": "coke",
    "category": "brands",
    "tags": "soda beverage",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pepsi",
    "icon": "pepsi",
    "category": "brands",
    "tags": "soda beverage",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Sq Rainbowdash",
    "icon": "raibowdshsq",
    "category": "cartoon",
    "tags": "mlp tv",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Umbrella Corp.",
    "icon": "umbrella",
    "category": "games",
    "tags": "resident_evil biohazard",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Giant Dad",
    "icon": "gdad",
    "category": "games",
    "tags": "dark_souls meme",
    "rarity": "SR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Chao",
    "icon": "chao",
    "category": "games",
    "tags": "sonic",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mortal Kombad Tier 1",
    "icon": "mortalk1",
    "category": "games",
    "tags": "multitier fighting",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Need for Speed",
    "icon": "needfspeed",
    "category": "games",
    "tags": "racing",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Swedish Meatball",
    "icon": "meatball",
    "category": "food",
    "tags": "meme pollux internal sweden food",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Smash Bros.",
    "icon": "ssb",
    "category": "games",
    "tags": "fighting nintendo",
    "rarity": "R",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "EarthBound Present Box",
    "icon": "eb_present",
    "category": "games",
    "event": "christmas_2017",
    "tags": "items",
    "rarity": "U",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Christmas Muffet",
    "icon": "xmasmuffet",
    "category": "games",
    "event": "christmas_2017",
    "tags": "undertale",
    "rarity": "SR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Christmas Ball Green",
    "icon": "xmasball_g",
    "category": "event",
    "event": "christmas_2017",
    "tags": "items",
    "rarity": "C",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Christmas Sock",
    "icon": "xmasock",
    "category": "event",
    "event": "christmas_2017",
    "tags": "sock",
    "rarity": "C",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Christmas Tree",
    "icon": "xmastree",
    "category": "event",
    "event": "christmas_2017",
    "tags": "tree",
    "rarity": "C",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "SB's Christmas Elf",
    "icon": "xxelf",
    "category": "event",
    "event": "christmas_2017",
    "tags": "elf",
    "rarity": "U",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "SB's Gingerman Ninja",
    "icon": "xxgingerninja",
    "category": "event",
    "event": "christmas_2017",
    "tags": "",
    "rarity": "U",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "SB's Nutcracker",
    "icon": "xxnutcracker",
    "category": "event",
    "event": "christmas_2017",
    "tags": "",
    "rarity": "R",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "SB's Santa Claus",
    "icon": "xxsanta",
    "category": "event",
    "event": "christmas_2017",
    "tags": "santa",
    "rarity": "UR",
    "meta": {
      "legacy": true
    }
  },
  {
    "name": "Pantsu",
    "icon": "pantsu",
    "category": "items",
    "tags": "panties anime underwear ecchi",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pizza",
    "icon": "pizza",
    "category": "food",
    "tags": "italy fast_food fat",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Zelda Heart Container",
    "icon": "zeldaheartcontainer",
    "category": "games",
    "tags": "tloz nintendo zelda",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "NASA",
    "icon": "nasa",
    "category": "brands",
    "tags": "space science organization",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Hentai Haven",
    "icon": "hentaiheaven",
    "category": "brands",
    "tags": "web service nsfw anime",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Riograndense Republic Flag",
    "icon": "repriograndense",
    "category": "flags",
    "tags": "south_america",
    "rarity": "UR",
    "howto": "", "event": null
  },
  {
    "name": "South Korea Flag",
    "icon": "southkorea",
    "category": "flags",
    "tags": "asia",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Puffle Multicolor",
    "icon": "pufflemulticolor",
    "category": "games",
    "tags": "club penguin rare pet",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Neptune´s Power",
    "icon": "power",
    "category": "games",
    "tags": "icon button hdn",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "ESA",
    "icon": "esa",
    "category": "brands",
    "tags": "european space organisation",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mario Luma",
    "icon": "marioluma",
    "category": "games",
    "tags": "Mario Luma",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Son Goku Pin",
    "icon": "songoku",
    "category": "pins",
    "tags": "dbz dragon_ball",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Spain Flag",
    "icon": "spain",
    "category": "flags",
    "tags": "europe",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Tea",
    "icon": "tea",
    "category": "food",
    "tags": "drink",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Isle Delfino",
    "icon": "isledelfino",
    "category": "games",
    "tags": "nintendo mario sunshine",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Phantom Thieves",
    "icon": "phanttieves",
    "category": "games",
    "tags": "persona persona5 p5",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "FBI",
    "icon": "fbi",
    "category": "brands",
    "tags": "federal organization",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mew",
    "icon": "mew",
    "category": "games",
    "tags": "pokemon legendary",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Cup of Noodles",
    "icon": "cupnoodle",
    "category": "food",
    "tags": "fast food noodles",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Russia Flag",
    "icon": "russia",
    "category": "flags",
    "tags": "europe",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Uganda Flag",
    "icon": "uganda",
    "category": "flags",
    "tags": "africa",
    "rarity": "SR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Millennium Eye",
    "icon": "millenniumeye",
    "category": "anime",
    "tags": "Yugioh eye pegasus relic",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Starbucks",
    "icon": "starbucks",
    "category": "brands",
    "tags": "hipsters coffee company",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pixel Link",
    "icon": "pixellink",
    "category": "games",
    "tags": "nintendo zelda",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Turkey Flag",
    "icon": "turkey",
    "category": "flags",
    "tags": "central_asia",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Minecraft",
    "icon": "minecraft",
    "category": "games",
    "tags": "sandbox mine mojang",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mario Sun Coin",
    "icon": "mariosuncoin",
    "category": "games",
    "tags": "gcn sunshine special coin",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Plants vs Zombies Walnut",
    "icon": "plantsvszombieswalnut",
    "category": "games",
    "tags": "pvz character",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Glasses",
    "icon": "glasses",
    "category": "items",
    "tags": "pollux glasses sass",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Sakura",
    "icon": "sakura",
    "category": "misc",
    "tags": "culture japan icon",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pixel Navi",
    "icon": "navitloz",
    "category": "games",
    "tags": "fairy zelda nintendo",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Google play",
    "icon": "googleplay",
    "category": "brands",
    "tags": "play store service mobile",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Google+",
    "icon": "flatgoogle",
    "category": "brands",
    "tags": "web service social",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Facebook",
    "icon": "facebook",
    "category": "brands",
    "tags": "web service social",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Origin",
    "icon": "origin",
    "category": "brands",
    "tags": "software game service",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Aisaka Taiga Pin",
    "icon": "taigaaisaka",
    "category": "pins",
    "tags": "anime girl",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Minoriku Shieda Pin",
    "icon": "minorikushieda",
    "category": "pins",
    "tags": "anime girl",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Bulgaria Flag",
    "icon": "bulgaria",
    "category": "flags",
    "tags": "europe",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Chile Flag",
    "icon": "chile",
    "category": "flags",
    "tags": "south_america",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Peru Flag",
    "icon": "peru",
    "category": "flags",
    "tags": "south_america",
    "rarity": "C",
    "howto": "", "event": null
  },
  {
    "name": "Skype",
    "icon": "skype",
    "category": "Brands",
    "tags": "voice chat software",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Cytus II : Neko",
    "icon": "cytusneko",
    "category": "Games",
    "tags": "neko logo from cytus_ll",
    "rarity": "C",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "You Tube",
    "icon": "youtube",
    "category": "Brands",
    "tags": "video service website",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Kawaii Rice Ball",
    "icon": "kawaiiriceball",
    "category": "Anime",
    "tags": "cute anime food",
    "rarity": "UR",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Diamond",
    "icon": "diamond",
    "category": "Item",
    "tags": "precious gem",
    "rarity": "U",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Cytus II : Neko2",
    "icon": "cytusneko",
    "category": "Games", "exclusive": "277391723322408960",

    "tags": "neko logo from cytus_ll",
    "rarity": "C",
    "public": false,

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "2ne1",
    "icon": "2ne1",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "C",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "4minute",
    "icon": "4minute",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "R",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Big Bang",
    "icon": "bigbang",
    "category": "K-Pop",
    "tags": "kpop boy group",
    "rarity": "R",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "BTS",
    "icon": "bts",
    "category": "K-Pop",
    "tags": "kpop boy group",
    "rarity": "U",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "EXID",
    "icon": "exid",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "C",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Gfriend",
    "icon": "gfriend",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "U",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Got7",
    "icon": "got7",
    "category": "K-Pop",
    "tags": "kpop boy group",
    "rarity": "C",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mamamoo",
    "icon": "mamamoo",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "C",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Red Velvet",
    "icon": "redvelvet",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "U",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Seventeen",
    "icon": "seventeen",
    "category": "K-Pop",
    "tags": "kpop boy group",
    "rarity": "UR",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "SNSD",
    "icon": "snsd",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "R",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Twice",
    "icon": "twice",
    "category": "K-Pop",
    "tags": "kpop girl group",
    "rarity": "U",
    "BUNDLE": "kpop",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "RAW",
    "icon": "raw",
    "category": "WrestlingLogos",
    "tags": "promotions, wwe",
    "exclusive": "323399715842424835",
    "rarity": "C",
    "public": false,

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Haitch Face",
    "icon": "haitch",
    "category": "IWD",
    "tags": "iwd, wwe",
    "exclusive": "323399715842424835",
    "rarity": "R",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Confederacy of Independent Systems",
    "icon": "swcis",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "C",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Clone Trooper",
    "icon": "clonetrooper",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "U",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Storm Trooper",
    "icon": "stormtrooper",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "C",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Star Wars - Imperial Forces",
    "icon": "swempire",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "UR",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Mandalorian",
    "icon": "swmandalorian",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "U",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Rebel Alliance",
    "icon": "swrebel",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "UR",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Star Wars - Republic",
    "icon": "swrepublic",
    "category": "movies",
    "tags": "starwars cinema sci-fi",
    "rarity": "SR",
    "BUNDLE": "starwars",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Assassins Creed : Creed Emblem",
    "icon": "ac_creed_emblem",
    "category": "games",
    "tags": "assassins creed ubisoft",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Assassins Creed : Egypt",
    "icon": "ac_origins_egypt",
    "category": "games",
    "tags": "assassins creed ubisoft",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Assassins Creed : Ottoman",
    "icon": "ac_otoman",
    "category": "games",
    "tags": "assassins creed ubisoft",
    "rarity": "SR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Castlevania : Ecclesia Gnostica",
    "icon": "castlevaniaecclesia",
    "category": "games",
    "tags": "castlevania order of ecclesia konami",
    "rarity": "R",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Diablo III Diablo",
    "icon": "diablo7",
    "category": "games",
    "tags": "rpg blizzard diablo",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Doki Doki Literature Club 1",
    "icon": "dokimedal1",
    "category": "games",
    "tags": "visual novel anime",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Doki Doki Literature Club Natsuki",
    "icon": "dokimedal4",
    "category": "games",
    "tags": "visual novel anime",
    "rarity": "R",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "DotA 2",
    "icon": "dota2",
    "category": "games",
    "tags": "moba valve dota",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Dragon's Crown : Crest 4",
    "icon": "dragons_crown4",
    "category": "games",
    "tags": "arcade rpg dnd",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Dragon's Crown : Crest 5",
    "icon": "dragons_crown5",
    "category": "games",
    "tags": "arcade rpg dnd",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Darkstalkers Huitzil",
    "icon": "dstalkers2",
    "category": "games",
    "tags": "fighting arcade dark stalkers",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Darkstalkers RRHood",
    "icon": "dstalkers5",
    "category": "games",
    "tags": "fighting arcade dark stalkers",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Darkstalkers Anakaris",
    "icon": "dstalkers7",
    "category": "games",
    "tags": "fighting arcade dark stalkers",
    "rarity": "R",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "FF Cactuar",
    "icon": "ff1",
    "category": "games",
    "tags": "square enix rpg fantasy",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "FF Chocobo Pixel",
    "icon": "ff3",
    "category": "games",
    "tags": "square enix rpg fantasy retro pixel",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Final Fantasy VII Logo",
    "icon": "finalfantasyvii",
    "category": "games",
    "tags": "square enix rpg fantasy",
    "rarity": "R",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Kritika",
    "icon": "kritika",
    "category": "games",
    "tags": "app game rpg",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Metroid Logo",
    "icon": "metroid1",
    "category": "games",
    "tags": "nintendo metroid ",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Samus Aran Helmet",
    "icon": "metroid3",
    "category": "games",
    "tags": "nintendo samus aran metroid suit",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pacman",
    "icon": "pacman",
    "category": "games",
    "tags": "pacman retro",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pacman Blinky",
    "icon": "pacman_blinky",
    "category": "games",
    "tags": "pacman retro",
    "rarity": "SR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pacman Clyde",
    "icon": "pacman_clyde",
    "category": "games",
    "tags": "pacman retro",
    "rarity": "R",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pacman Inky",
    "icon": "pacman_inky",
    "category": "games",
    "tags": "pacman retro",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Pacman Pinky",
    "icon": "pacman_pinky",
    "category": "games",
    "tags": "pacman retro",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Resident Evil 6 Logo",
    "icon": "re6cov",
    "category": "games",
    "tags": "resident evil",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Splatoon Inkling",
    "icon": "splatoon1",
    "category": "games",
    "tags": "nintendo squid splatoon inkling",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "We Happy Few Folk",
    "icon": "wehappyfew1",
    "category": "games",
    "tags": "we_happy_few folk",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "We Happy Few Guard",
    "icon": "wehappyfew3",
    "category": "games",
    "tags": "we_happy_few guard",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "The Witcher Logo",
    "icon": "witcherclaws",
    "category": "games",
    "tags": "witcher logo",
    "rarity": "C",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "The Legend of Zelda :  Midna",
    "icon": "zeldamidna",
    "category": "games",
    "tags": "zelda twilight midna",
    "rarity": "UR",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "The Legend of Zelda :  Ocarina",
    "icon": "zeldaocarina",
    "category": "games",
    "tags": "zelda ocarina item",
    "rarity": "U",
    "howto": "", "BUNDLE": "vidya",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Hungary Flag",
    "icon": "hungary",
    "category": "flags",
    "tags": "europe",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "India Flag",
    "icon": "india",
    "category": "flags",
    "tags": "asia",
    "rarity": "U",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Nicaragua Flag",
    "icon": "nicaragua",
    "category": "flags",
    "tags": "america central_america",
    "rarity": "U",
    "howto": "", "event": null
  },
  {
    "name": "Saudi Arabia Flag",
    "icon": "saudiarabia",
    "category": "flags",
    "tags": "middle_east asia",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Serbia Flag",
    "icon": "serbia",
    "category": "flags",
    "tags": "europe",
    "rarity": "C",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "South Africa Flag",
    "icon": "southafrica",
    "category": "flags",
    "tags": "africa",
    "rarity": "R",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Vatican City Flag",
    "icon": "vatican",
    "category": "flags",
    "tags": "europe",
    "rarity": "UR",
    "howto": "",
    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "May 9th Star",
    "icon": "may9m1",
    "category": "special",
    "tags": "special holiday russia",
    "rarity": "UR",
    "howto": "",
    "public": false,
    "BUNDLE": "m9",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "May 9th Coat of Arms",
    "icon": "may9m2",
    "category": "special",
    "tags": "special holiday russia",
    "rarity": "UR",
    "howto": "",
    "public": false,
    "BUNDLE": "m9",

    "meta": {
      "legacy": true
    },
    "event": null
  },
  {
    "name": "Japan",
    "icon": "japan",
    "category": "flags",
    "tags": "country flag",
    "rarity": "UR",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Bulgaria",
    "icon": "bulgaria",
    "category": "flags",
    "tags": "country flag",
    "rarity": "U",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Nicaragua",
    "icon": "nicaragua",
    "category": "flags",
    "tags": "country flag",
    "rarity": "U",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Brazil",
    "icon": "brazil",
    "category": "flags",
    "tags": "country flag",
    "rarity": "SR",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Riograndense Republic",
    "icon": "repriograndense",
    "category": "flags",
    "tags": "country flag",
    "rarity": "SR",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "India",
    "icon": "india",
    "category": "flags",
    "tags": "country flag",
    "rarity": "SR",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Norway",
    "icon": "norway",
    "category": "flags",
    "tags": "country flag",
    "rarity": "SR",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Argentina",
    "icon": "argentina",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Canada",
    "icon": "canada",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Finland",
    "icon": "finland",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Italy",
    "icon": "italy",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Peru",
    "icon": "peru",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Romania",
    "icon": "romania",
    "category": "flags",
    "tags": "country flag",
    "rarity": "R",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  },
  {
    "name": "Portugal",
    "icon": "portugal",
    "category": "flags",
    "tags": "country flag",
    "rarity": "C",
    "howto": "",
    "public": false,
    "BUNDLE": "World Flags 2.0",
    "event": null
  }];
