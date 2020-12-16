let CURRCHOICE = {   
        name:"currency",
        description: "💵 The currency to be used",
        type: 3,
        choices:[
            {name: "Rubines", value: "RBN", default: true},
            {name: "Sapphires", value: "SPH"},
        ]
    }
    
    let ITEMCHOICE = {   
        name:"item",
        required: true,
        description: "⚱️ The item's name or ID",
        type: 3,  
    }


module.exports = {
    name: "market",
    description: "Marketplace actions",
    beta: true,
    options: [

        {
            name: "post",
            description: " Creates a new listing",
            type: 2,
            options:[
                {
                    name: "sell",
                    description: "🛍️ Post an item for sale",
                    type: 1,
                    options:[
                        ITEMCHOICE,
                        CURRCHOICE,
                    ]

                },
                {
                    name: "buy",
                    description: "🛍️ Post an offer to buy an item",
                    type: 1,
                    options:[
                        ITEMCHOICE,
                        CURRCHOICE,
                    ]

                    
                    
                }
            ]
            
        },
        {
            name: "list",
            description: "List Entries",
            type: 2,
            default: true,
            options: [
                {
                    name: "Self",
                    description: "🧾 List your own entries",
                    type: 1,
                    default: true,
                    value: "SELF"

                },
                {
                    name: "Player",
                    description: "📕 List entries from a player.",
                    type: 1,
                    options: [
                        {
                            name: "player",
                            description: "The player to be searched.",
                            type: 6,
                            required: true
                        }
                    ]

                },
                {
                    name: "Item",
                    description: "⚱️ The item you want to search.",
                    type: 1,
                    options: [
                        ITEMCHOICE
                    ]
                    

                },
            ]
        },
        {
            name: "remove",
            description: "♻️ Remove Entries",
            type: 1,
            options: [
                {
                    name: "entry",
                    required: true,
                    description: "The entry ID of the listing you wanna remove.",
                    type: 3
                }
            ]
        },
    ],
    exec: async function exec(req){
        return {
            type: 4,
            data: {
              content: "DEMO"
            }
          };
    }
  }
  