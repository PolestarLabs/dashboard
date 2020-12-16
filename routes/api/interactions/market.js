let CURRCHOICE = {   
        name:"currency",
        description: "The currency to be used",
        type: 3,
        choices:[
            {name: "Rubines", value: "RBN"},
            {name: "Sapphires", value: "SPH"},
        ]
    }

let ITEMCHOICE = {   
        name:"item",
        description: "the item to sell",
        type: 3,
  
    }


module.exports = {
    name: "market",
    description: "Marketplace actions",
    beta: true,
    options: [

        {
            name: "post",
            description: "Creates a new listing",
            type: 2,
            options:[
                {
                    name: "sell",
                    description: "Post an item for sale",
                    type: 1,
                    options:[
                        CURRCHOICE
                    ]

                },
                {
                    name: "buy",
                    description: "Post an offer to buy an item",
                    type: 1,
                    options:[
                        CURRCHOICE
                    ]

                    
                    
                }
            ]
            
        },
        {
            name: "list",
            description: "List Entries",
            type: 1,
            oprtion: [
                {
                    name: "self",
                    description: "List your own entries",
                    type: 3,
                    value: 

                },
                {
                    name: "user",
                    description: "List entries from a user.",
                    type: 6,

                },
                {
                    name: "item",
                    description: "The item you want to search.",
                    type: 3,

                },
            ]
        },
        {
            name: "remove",
            description: "Remove Entries",
            type: 1,
            options: [
                {
                    name: "entry",
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
  