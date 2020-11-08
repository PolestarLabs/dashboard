const CRAFTING = new Vue({
  el: "#crafting",
  data: {
    craftingNow: false,
    pot: [],
    inventory: { loading: true },
    discovery: { loading: false },
    balance: {
      SPH: userdata.modules.sapphires,
      RBN: userdata.modules.rubines,
      JDE: userdata.modules.jades,
    },
    cantSPH: false,
    cantJDE: false,
    cantRBN: false,
  },
  methods: {
    removeFromPot(current_item, all) {
      let item = this.inventory.find((it) => it.id === current_item.id);

      if (current_item) {
        item.count++;
        current_item.count--;
      }
      if (current_item.count <= 0 || all) {
        item.count += current_item.count;
        this.pot = this.pot.filter((itm) => itm.id !== current_item.id);
      }
      this.fetchDiscovery();
    },
    canCraft() {
      let GC = (this.discovery.discovery || {}).gemcraft;
      if (!this.discovery.discovery) return false;
      if (!GC) return true;
      if (GC.jades > this.balance.JDE) {
        this.cantJDE = true;
        return false;
      } else {
        this.cantJDE = false;
      }
      if (GC.rubines > this.balance.RBN) {
        this.cantRBN = true;
        return false;
      } else {
        this.cantRBN = false;
      }
      if (GC.sapphires > this.balance.SPH) {
        this.cantSPH = true;
        return false;
      } else {
        this.cantSPH = false;
      }
      return true;
    },
    craft() {
      this.craftingNow = true;
      let wait = new Promise(async (res) => {
        setTimeout((_) => res(true), 3250);
      });

      let cost = this.discovery.typeCraft
        ? this.discovery.discovery.typeCraft
        : this.discovery.discovery.materials;

      

      let payPot = [];

      this.pot.forEach((potItem) => {
        let costItem = this.discovery.typeCraft
          ? cost.find((i) => i.type || i === potItem.type)
          : cost.find((i) => i.id || i === potItem.id);

        if (typeof costItem === "string") costItem = { id: costItem, count: 1 };

        while (costItem.count > 0 && potItem.count > 0) {
          potItem.count -= 1;
          costItem.count -= 1;
          let pot_temp = payPot.find((i) => i.id === potItem.id);
          if (pot_temp) pot_temp.count++;
          else payPot.push({ id: potItem.id, count: 1 });
        }
        if (potItem.count > 0) {
          try {
            //this.inventory.find(i=> i.id === item.id).count +=  thisItem.count;
          } catch (err) {
            //this.inventory.push(thisItem);
          }
        } else {
          this.pot = this.pot.filter((i) => i.id !== potItem.id);
        }
      });
      this.commitCraft(this.discovery.discovery.id, payPot).then( async (res) => {

        let i = 0;
        await wait;
        console.log(res);
        
      let thisOnInventory = this.inventory.find(
        (i) => i.id === this.discovery.discovery.id
      );
      if (thisOnInventory) {
        thisOnInventory.count += 1
        thisOnInventory.new = true
      } else {
        this.inventory.unshift({
          count: 1,
          id: this.discovery.discovery.id,
          meta: this.discovery.discovery,
          new: true
        });
      }

      
       
  

          notify(
            `<img width=50 src='https://beta.pollux.gg/build/items/${this.discovery.discovery.icon}.png'/> ` +
              this.discovery.discovery.name +
              " added to inventory."
          );
          this.craftingNow = false;
          this.discovery = { loading: false };
          this.fetchDiscovery();
        }
      );

      //this.pot = []
    },
    addToPot(item, all) {
      console.log(item);
      let current_item = this.pot.find((it) => it.id === item.id);
      if (item.count < 1) return notify("you don't have any more of this item");
      if (current_item) {
        item.count--;
        current_item.count++;
      } else {
        if (this.pot.length >= 3) return notify("Crafting Table is full!");
        if (!all) {
          item.count--;
          this.pot.push({
            id: item.id,
            count: 1,
            rarity: item.meta.rarity,
            type: item.meta.type,
            icon: item.meta.icon,
          });
        }
      }
      if (all) {
        if (current_item) current_item.count += item.count;
        else
          this.pot.push({
            id: item.id,
            rarity: item.meta.rarity,
            type: item.meta.type,
            count: item.count,
            icon: item.meta.icon,
          });
        item.count = 0;
      }

      this.fetchDiscovery();
    },
    commitCraft(item, pot) {
      console.log({ pot });
      return new Promise(async (resolve) => {
        fetch("https://beta.pollux.gg/api/crafting/create", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify({ pot, item }),
        }).then((r) => r.json().then(resolve));
      });
    },
    fetchDiscovery() {
      this.discovery = { loading: true };
      if (!this.pot.length) return (this.discovery = { loading: false });
      fetch("https://beta.pollux.gg/api/crafting/mix", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ pot: this.pot }),
      }).then((r) => r.json().then((res) => (this.discovery = res)));
    },

    potLevel() {
      let lv = 0;
      this.pot[0] ? (lv = 1) : 0;
      this.pot[1] ? (lv = 2) : 0;
      this.pot[2] ? (lv = 3) : 0;
      this.discovery.canCraftNow ? (lv = 5) : 0;

      return "craft" + lv;
    },
  },
});

fetch(
  "https://beta.pollux.gg/api/user/" + userdata.id + "/inventory"
).then((r) => r.json().then((res) => (CRAFTING.inventory = res)));

function notify(N) {
  PLX.notification(N);
}
