 


fetch(`/api/v1/user/${userprofile.id}/backgrounds`).then(r =>
    r.json().then(res =>  PROFILE.backgrounds = res )
);
fetch(`/api/v1/user/${userprofile.id}/medals`).then(r =>
    r.json().then(res =>  PROFILE.medals = res )
);
fetch(`/api/v1/user/${userprofile.id}/stickers`).then(r =>
    r.json().then(res =>  PROFILE.stickers = res )
);
fetch(`/api/v1/user/${userprofile.id}/inventory`).then(r =>
    r.json().then(res =>  PROFILE.inventory = res )
);
