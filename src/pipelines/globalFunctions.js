const BOT_PATH = process.env.BOT_PATH;
const LOCALES_PATH = process.env.LOCALES_PATH;
const request = require("request");
const cfg = require("../../config");
const Path = require("path");

// const DB = require('../database')
const VARS = require("./vars.js");
// const gear = {}// require('../../core/gearbox.js');
const fs = require("fs");

module.exports = {
  userBasics: function (USR) {
    try {
      return {
        pix: `https://cdn.discordapp.com/avatars/${USR.id}/${USR.avatar}.png`,
        name: USR.username,
        uname: USR.username,
        id: USR.id,
      };
    } catch (e) {
      return this.universaldummy();
    }
  },

  api: function (scope, id, method, payload) {
    console.log("request================================================");
    return new Promise(async (resolve) => {
      let options = {
        method: method || "GET",
        url: "https://discordapp.com/api/" + scope + "/" + id,
        headers: {
          "Content-Type": "application/json",
          "cache-control": "no-cache",
          authorization: PLX._token,
        },
      };
      console.log("request");
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        resolve(JSON.parse(body));
        console.log(body, typeof body, "request");
      });
    });
  },

  universaldummy: function universaldummy() {
    return undefined;
    return {
      pix: `https://www.atomix.com.au/media/2015/06/atomix_user31.png`,
      name: `Guest`,
      uname: "GUEST",
      id: "0",
      discriminator: "0000",
    };
  },

  userDatabaseInfo: async function userDatabaseInfo(id, req) {
    //let client_user = await bot.fetchUser(id) ;
    let dbpars;

    dbpars = await DB.users.findOne({ id: id });
    try {
      if (!dbpars) {
        req.user.tag = req.user.username;
        await DB.users.new(req.user);
        dbpars = await DB.users.findOne({ id: id });
      }
    } catch (e) {
      if (!dbpars) {
        if (req.user) {
          await DB.users.new(req.user);
          dbpars = await DB.users.findOne({ id: id });
        } else {
          return null;
        }
      }
    }
    return dbpars;
  },

  flatten: function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
      return flat.concat(
        Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
      );
    }, []);
  },

  checkAuth: function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.render("needlogin");
  },

  failsafe: async function failsafe(dbo, req) {
    return;

    //console.log("ESSE [E P DENO",dbo)
    if (typeof dbo != "object" || !dbo.modules) {
      dbo = defaults.udefal;
      try {
        await fx.run("userSetup", { id: req.user.id, name: req.user.name });
        dbo = await userDB.findOne({ id: req.user.id });
      } catch (e) {
        console.log(e);
      }
    }

    return dbo;
  },

  cmsSetup: function cmsSetup(req) {
    let lang = req.query.lang == "en" ? "dev" : req.query.lang || "dev";
    let json;

    try {
      json = JSON.parse(
        fs.readFileSync(LOCALES_PATH + (lang || "dev") + "/commands.json")
      );
    } catch (e) {
      console.log(e);

      json = JSON.parse(
        fs.readFileSync(LOCALES_PATH + (lang || "dev") + "/commands.json")
      );
    }
    let aliases = {}; // just in case so it doesnt break
    json.lang = lang;
    let CMS = this.getComms(json, aliases);

    return {
      lang: lang,
      json: json,
      aliases: aliases,
      CMS: CMS,
      CATS: VARS.CATS,
    };
  },

  getComms: function getComms(json, aliases) {
    let bot_core_path = Path.resolve(BOT_PATH, "./core");
    let path_polaris = Path.resolve(BOT_PATH, "./core");
    let command_cats = fs.readdirSync(bot_core_path + "/commands");
    let COMMANDS = {};
    let hidden = false;
    COMMANDS.list = [];
    COMMANDS.categories = [];
    COMMANDS.collection = [];
    // console.log(files)

    for (let i = 0; i < command_cats.length; i++) {
      let command_cat_folder = Path.resolve(bot_core_path, "./commands/", command_cats[i]);

      if (
        command_cats[i] != "dev" &&
        command_cats[i] != "experimental" &&
        command_cats[i] != "structures" &&
        command_cats[i] != "donators" &&
        command_cats[i] != "owner" &&
        !command_cats[i].startsWith("_") &&
        command_cats[i] != "eastereggs"
      )
        hidden = true;
      else hidden = false;

      let command_files = fs.readdirSync(command_cat_folder);

      global.appRoot = Path.resolve(BOT_PATH);
      global.paths = require(Path.resolve(BOT_PATH, "./utils/paths"));

      for (let y = 0; y < command_files.length; y++) {
        if (!["imgreactor.js", "unstructured"].includes(command_files[y])) {
          command_files[y] = command_files[y].replace(".js", "");
          COMMANDS.list.push(command_files[y].replace(".js", ""));
          let smolAlias = Object.keys(aliases).map((a) => {
            return { alias: a, comm: aliases[a] };
          });

          try {
            delete require.cache[
              require.resolve(
                `${bot_core_path}/commands/${command_cats[i]}/${command_files[y]}`
              )
            ];
            let c = require(`${bot_core_path}/commands/${command_cats[i]}/${command_files[y]}`);
            //console.log({cat})
            if (!c.pub) hidden = true;
            else hidden = false;

            let categ =
              VARS.CATS.find((ctgry) => ctgry.tags.includes(c.cat)) ||
              VARS.CATS.find((ctgry) => ctgry.tags.includes(command_cats[i])) ||
              {};
            COMMANDS.collection.push({
              name: c.cmd,
              cat: categ.consolidated || "misc",
              catName: categ.name || "misc" || "Misc.",
              aliases: c.aliases || [],
              //,aliases_ext:(c.aliases||[]).concat(smolAlias.filter(a=>a.comm==c.cmd).map(a=>a.alias) )
              perms: c.botPerms,
              desc: $t(["commands:help." + c.cmd, ""], {
                lngs: [json.lang, "en", "dev"],
              }),
              use: $t(["commands:usage." + c.cmd, ""], {
                lngs: [json.lang, "en", "dev"],
              }),
              filename: command_files[y],
              hidden,
            });
          } catch (e) {
            //console.log((morefiles[y]+"").magenta)
            let hidden;
            try {
              let {
                pub,
              } = require(`${bot_core_path}/commands/${command_cats[i]}/${command_files[y]}`);

              hidden = pub || true;
              console.log((command_files[y] + "").yellow, pub);
            } catch (e) {
              console.log(
                (" " + command_files[y] + " ").bgRed + " Error parsing command!".red
              );
              console.log(e.message.yellow);
              console.log("-------------------".gray);
              hidden = true;
            }
            let command_file_name = command_files[y].replace(".js", "");
            let categ =
              VARS.CATS.find((ctgry) => ctgry.tags.includes(command_cats[i])) || {};

            COMMANDS.collection.push({
              name: command_file_name,
              cat: categ.consolidated || "misc",
              catName: categ.name || "Misc.",
              aliases: [],
              aliases_ext: smolAlias
                .filter((a) => a.comm == command_file_name)
                .map((a) => a.alias),
              perms: [],
              desc: $t(["commands:help." + command_file_name, ""], {
                lngs: [json.lang, "en", "dev"],
              }),
              use: $t(["commands:usage." + command_file_name, ""], {
                lngs: [json.lang, "en", "dev"],
              }),
              filename: command_files[y],
              hidden,
            });
          }
        }
      }
    }

    return COMMANDS;
  },

  xss_me: function xss_me(res, respack) {
    respack.b = "Sorry";
    respack.t = "Are you trying something funny?";
    respack.m = "You do not own the background you're trying to apply!";
    res.send(respack);
  },

  ZT: function ZT(x) {
    let r = randomize(0, interj[x].length);
    return interj[x][r];
  },
};
