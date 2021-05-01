module.exports = {
  name: "poi",
  description: "Says poi poi!",
  beta: true,
  exec: async function exec(req,params){
    console.log(JSON.stringify(params, 0, 2),"whats inside");
      return {
          type: 4,
          data: {
            content: "poi poi poi poi"
          }
        };
  }
}
