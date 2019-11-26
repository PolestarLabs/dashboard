// const gear = require('../../bot/core/utilities/Gearbox');
let col = {
  "err": "#dd2121",
  "oks": "#4754f2",
  "suc": "#68cb4a"
}
let respack = {
  s: "error",
  t: "ERROR", //ZT("error"),
  m: "Something went wrong Server-side :(",
  c: col.err,
  b: "Geez"
}

let EVENT = null

const interj = {
  success: [
       "All done!",
       "All done!",
       "All set!",
      "Done!",
      "Nice!",
       "Great!",
       "Yay!",
       "Alrighty~!"
  ],
  error: [
      "Oops!",
      "Uh-oh!",
      "Oh no!",
      "Geez!",
      "Holy Shit!",
      "I'm Sorry...",
      "Whoopsie!",
      "Well that's embarassing..."
        ]
}

function ZT(x) {
  let r = randomize(0, interj[x].length)
  return interj[x][r]
}

const CATS = [
  {
    name: "Social",
    description: "Profile, Ranks, and other user interactions",
    tags: ['social'],
    consolidated: 'social'
  },
  {
    name: "Collectibles",
    description: "Items for customization and show off",
    tags: ['cosmetics'],
    consolidated: 'cosmetics'
  },
  {
    name: "Moderation",
    description: "Server management stuff",
    tags: ['mod', 'moderation', 'master'],
    consolidated: 'mod'
  },
  {
    name: "Fun",
    description: "Break the ice with a well-timed one from these",
    tags: ['4fun', 'fun', 'forFun'],
    consolidated: 'fun'
  },
  {
    name: "Minigames",
    description: "Spend some time playing minigames",
    tags: ['gambling', 'minigames','games'],
    consolidated: 'minigames'
  },
  {
    name: "Economy",
    description: "Money money money money! As the true capitalists we are",
    tags: ['$', 'rubines', 'economy'],
    consolidated: 'economy'
  },
  {
    name: "Utility",
    description: "These might come in handy, believe me",
    tags: ['util'],
    consolidated: 'util'
  },
  {
    name: "Memes",
    description: "The crème de la crème of unusual memes",
    tags: ['frenes', 'memes'],
    consolidated: 'memes'
  },
  {
    name: "Anime",
    description: "Quality weeb stuff desu yo",
    tags: ['anime', 'weeb'],
    consolidated: 'anime'
  },
  {
    name: "Roleplay",
    description: "The RPG player's toolkit",
    tags: ['rpg', 'roleplay'],
    consolidated: 'roleplay'
  },
  {
    name: "Images & Random",
    description: "Random Images / Gifs / Videos for all your visual expression needs",
    tags: ['img','random'],
    consolidated: 'img'
  },
  {
    name: "Sound",
    description: "Some moments might just require one",
    tags: ['sound'],
    consolidated: 'sound'
  },
  {
    name: "Miscellaneous",
    description: "Anything so weird it doesn't fit in any other category",
    tags: ['misc', 'other'],
    consolidated: 'misc'
  },
  {
    name: "NSFW",
    description: "Self-explanatory",
    tags: ['nsfw', 'lewd'],
    consolidated: 'nsfw'
  },
  {
    name: "Settings",
    description: "Pollux configuration options",
    tags: ['infra', 'bot', 'config', 'settings', 'locale'],
    consolidated: 'config'
  },
  {
    name: "Custom",
    description: "Custom commands requested by donators. You're wandering into a dark place, be wary!",
    tags: ['donators'],
    consolidated: 'custom'
  }
]

module.exports = {
  col,
  respack,
  EVENT,interj,ZT,CATS
}