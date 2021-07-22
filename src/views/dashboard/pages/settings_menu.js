const Customization = new Vue({
  el: "#custom-options",
  components: {
    "v-select": VueSelect.VueSelect,
  },
  data: {
    selectDeckTarot: myDeckTarot,
    decksAvailableTarot,
    isSearchBlurTarot: true,
    selectDeckCasino: myDeckCasino,
    decksAvailableCasino,
    isSearchBlurCasino: true,
  },
  methods: {
    onChangeDeck() {
      saveDeck(this);
    },
    howToDeck() {
      Swal.fire({
        //title:
        html: "Decks can be obtained via <b>Specialized Crafting</b>",
        type: "info",
        confirmButtonText: "Hmmm I see...",
      });
    },
  },
});

const Roleplay = new Vue({
  el: "#roleplay",
  components: {},
  data: {
    attributes: [...ATTR],
    attributes_bkp: [...ATTR],
    highlight: "",
    editing: "",
  },
  methods: {
    enableEditing() {
      this.editing = true;
    },
    addAttr() {
      this.attributes.push({ tag: "new_tag", value: "new value" });
    },
    saveAttr() {
      saveAttr(this.attributes);
    },
    resetAttr() {
      this.attributes = [...ATTR];
    },
    isMacro(attr) {
      return attr.tag.startsWith("!");
    },
    isDice(v) {
      if (!v.includes("d")) return false;
      return v.match(/[0-9]?d[0-9]+/g);
    },
    diceValue(v) {
      if (!v.includes("d")) return null;
      return v.replace(/[0-9]?d([0-9]+)/g, "$1");
    },
    isTag(part) {
      return this.attributes.map((x) => x.tag).includes(part);
    },
    isHighlighted(item) {
      return this.highlight == item;
    },
  },
});

function saveDeck(C) {
  Promise.all([
    fetch(`/dash/misc/skin`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        skinFor: "casino",
        skinId: C.selectDeckCasino.localizer,
      }),
      method: "PATCH",
    }),
    fetch(`/dash/misc/skin`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        skinFor: "tarot",
        skinId: C.selectDeckTarot.localizer,
      }),
      method: "PATCH",
    }),
  ]).then((res) => processRes(res, "Skins", "Deck Skins Saved!"));
}

function saveAttr(attrSet) {
  fetch(`/dash/misc/attr`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ attrSet }),
    method: "PATCH",
  }).then((res) => processRes(res, "Attributes", "Attributes Saved!"));
}

$("#settings-options input").change(function () {
  let settings = {
    ownerNotif: $("#enable-dm-alerts-sv-changes").prop("checked"),
    dmWelcome: $("#dm-welcome-opt-out").prop("checked"),
    newCommand: $("#new_command").prop("checked"),
    patchNotes: $("#patch_note").prop("checked"),
    events: $("#events").prop("checked"),
    newCosmetics: $("#cosmetics").prop("checked"),
    miscAnnouncements: $("#general_announcements").prop("checked"),
    partnerAnnouncements: $("#partner_announcements").prop("checked"),
  };

 

  return fetch(`/dash/misc/notifs`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(settings),
    method: "PATCH",
  }).then((res) =>
    processRes(res, "Notifications", "Notification Settings Saved!")
  );
});

$(".markall").click(function () {
  var cat = $(this).data("cat");
  $(".cat_" + cat + " input").prop("checked", this.checked);
});
