module.exports = {
  name: "poi",
  description: "Says poi poi!",
  beta: true,
  exec: async function exec(req){
      return {
          type: 4,
          data: {
            content: "poi poi poi poi"
          }
        };
  }
}
