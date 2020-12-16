modules.export = {
    execute: async function exec(req){
        return res.json({
            type: 4,
            data: {
              content: "is this person salty? yes."
            }
          });
    }
}    