 


fetch(`/api/user/${userprofile.id}/backgrounds`).then(r =>
    r.json().then(res =>  PROFILE.backgrounds = res )
);
fetch(`/api/user/${userprofile.id}/medals`).then(r =>
    r.json().then(res =>  PROFILE.medals = res )
);
fetch(`/api/user/${userprofile.id}/stickers`).then(r =>
    r.json().then(res =>  PROFILE.stickers = res )
);
fetch(`/api/user/${userprofile.id}/inventory`).then(r =>
    r.json().then(res =>  PROFILE.inventory = res )
);
