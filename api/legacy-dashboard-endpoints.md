# Legacy dashboard endpoints to port to Elysia API v2

## Public/profile-related

- `GET /api/v1/user/:id`
- `GET /api/v1/user/:id/commends?full=1`
- `GET /api/v1/user/:id/commends/in?full=1`
- `GET /api/v1/user/:id/backgrounds`
- `GET /api/v1/user/:id/medals`
- `GET /api/v1/user/:id/stickers`
- `GET /api/v1/user/:id/inventory`
- `GET /api/v1/relationships?uid=:id&plxdata=1`
- `GET /api/v1/relationships?uid=:id`
- `GET /api/v1/cosmetics/stickers/:stickerId`
- `GET /api/v1/cosmetics/backgrounds/:bgId`
- `GET /api/v1/cosmetics/backgrounds/:bgId/colors`
- `GET /api/v1/cosmetics/backgrounds/custom`
- `PATCH /api/v1/cosmetics/backgrounds/custom`
- `GET /api/v1/cosmetics/count/background`
- `GET /api/v1/cosmetics/count/sticker`
- `GET /api/v1/cosmetics/count/medal`
- `GET /api/v1/cosmetics/search?type=medal&icon=:icon`
- `GET /api/v1/achievements/:id`
- `GET /dash/imgbookmarks/:id`

## Profile edit (medals, colors, cosmetics)

- `PUT /dashboard/profile/medals`
- `PATCH /dashboard/profile/tagline`
- `PATCH /dashboard/profile/personaltxt`
- `PATCH /dashboard/profile/color`
- `PATCH /dashboard/profile/sticker`
- `PATCH /dashboard/profile/background-legacy`
- `PATCH /dashboard/profile/wife`
- `PATCH /dashboard/profile/flair`
- `PATCH /dashboard/profile/frame`
- `GET /api/v1/user/:id/bgs`
- `GET /api/v1/user/:id/medals`
- `GET /api/v1/items/search?type=boosterpack&all=1`
- `GET /api/v1/items/search?type=boosterpack`

## Shop / marketplace

- `GET /api/v1/cosmetics/search?type=background`
- `GET /api/v1/cosmetics/search?type=medal`
- `GET /api/v1/cosmetics/search?type=sticker`
- `GET /api/v1/cosmetics/search?type=skin`
- `GET /api/v1/cosmetics/search?type=flair`
- `GET /api/v1/items/search?open=true`
- `GET /api/v1/cosmetics/search?type=background&event=null`
- `GET /api/v1/shop/bgrotation`
- `GET /api/v1/shop/userrotation`
- `GET /api/v1/items/search?type=boosterpack`
- `GET /api/v1/marketplace?limit=100`
- `GET /api/v1/marketplace/rates`

These should be mapped into the Elysia API with typed request/response schemas and auth rules, then consumed from the new Vue 3 frontend via the typed `apiClient` layer.

