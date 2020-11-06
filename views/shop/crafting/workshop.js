const CRAFTING = new Vue({
  el: "#crafting",
  data: {
    pot: [],
    inventory: { loading: true },
    discovery: { loading: false },
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
    craft() {
      let cost = this.discovery.typeCraft
        ? this.discovery.discovery.typeCraft
        : this.discovery.discovery.materials;
      cost.forEach((item) => {
        let thisItem = this.pot.find((i) => i.id === item.id || item);
        thisItem.count -= item.count || 1;
        //let itemOnInvent = this.inventory.find(i=> i.id === item.id);
        //if (itemOnInvent.count < 1) this.inventory = this.inventory.filter(i=>i.id!==itemOnInvent.id)
        if (thisItem.count > 0) {
          try {
            //this.inventory.find(i=> i.id === item.id).count +=  thisItem.count;
          } catch (err) {
            //this.inventory.push(thisItem);
          }
        } else {
          this.pot = this.pot.filter((i) => i.id !== thisItem.id);
        }
      });
      let thisOnInventory = this.inventory.find(
        (i) => i.id === this.discovery.discovery.id
      );
      if (thisOnInventory) thisOnInventory.count += 1;
      else {
        this.inventory.unshift({
          count: 1,
          id: this.discovery.discovery.id,
          meta: this.discovery.discovery,
        });
      }
      notify(
        `<img width=50 src='https://beta.pollux.gg/build/items/${this.discovery.discovery.icon}.png'/> ` +
          this.discovery.discovery.name +
          " added to inventory."
      );
      this.discovery = { loading: false };

      //this.pot = []

      this.fetchDiscovery();
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
    fetchDiscovery() {
      this.discovery = { loading: true };
      if (!this.pot.length) return (this.discovery = { loading: false });
      fetch("https://beta.pollux.gg/api/crafting/mix", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ pot: this.pot }),
      }).then((r) => r.json().then((res) => (this.discovery = res)));
    },
  },
});

fetch("https://beta.pollux.gg/api/user/88120564400553984/inventory").then((r) =>
  r.json().then((res) => (CRAFTING.inventory = res))
);

function notify(N) {
  PLX.notification(N);
}
