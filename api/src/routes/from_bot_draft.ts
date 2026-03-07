

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";



// QUESTS

export const questsRoutes = new Elysia({  prefix: "/", tags: ["quests","progression"] })
  .use(authPlugin)
  .use(dbPlugin)


  // GET /quests/:questGenericID --> get the details of a quest based on its generic ID (which is the same for all users) | app-authed
  .get("/quests/:questGenericID", ({ params }) => {
    const { questGenericID } = params;
    // get the details of a quest based on its generic ID (which is the same for all users) 
  })


  // USER QUESTS

  // GET /user/:userID/quests/ --> get all quests and their progression for the authenticated user | user-only (can only get own progression) | admin can get any user's progression
  .get("/user/:userID/quests", ({ params }) => {
    const { userID } = params;
    // get all quests and their progression for the authenticated user 
  })

  // PATCH /user/:userID/quests --> bulk update the progression of all quests for the authenticated user | app-authed
  .patch("/user/:userID/quests", ({ params }) => {
    const { userID } = params;
    // bulk update the progression of all quests for the authenticated user 
  })

  // POST /user/:userID/quests/:questGenericID --> assigns a quest to the user based on the generic ID (which is the same for all users) and creates a unique quest ID for that quest instance | app-authed
  .post("/user/:userID/quests/:questGenericID", ({ params }) => {
    const { userID, questGenericID } = params;
    // assigns a quest to the user based on the generic ID (which is the same for all users) and creates a unique quest ID for that quest instance 
  })

  // GET /user/:userID/quests/:questUniqID --> get the progression of a specific quest for the authenticated user | user-only (can only get own progression) | admin can get any user's quest progression
  .get("/user/:userID/quests/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // get the progression of a specific quest for the authenticated user 
  })
  .get("/quests/:userID/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // alias for the above route, get the progression of a specific quest for the authenticated user 
  })

  // PATCH /user/:userID/quests/:questUniqID --> update the progression of a specific quest for the authenticated user | app-authed
  .patch("/user/:userID/quests/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // update the progression of a specific quest for the authenticated user 
  })

  // PUT /user/:userID/quests/:questUniqID --> override the progression of a specific quest for the authenticated user | app-authed
  .put("/user/:userID/quests/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // override the progression of a specific quest for the authenticated user 
  })

  // DELETE /user/:userID/quests/:questUniqID --> deletes a specific quest progression for the authenticated user | app-authed
  .delete("/user/:userID/quests/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // deletes a specific quest progression for the authenticated user 
  })

  // POST /user/:userID/quests/resolve/:questUniqID --> gets the status and triggers resolutions if the specific quest is completed for the authenticated user | user-only (can only get own progression) | app-authed
  // -> returns rewards on success
  .post("/user/:userID/quests/resolve/:questUniqID", ({ params }) => {
    const { userID, questUniqID } = params;
    // questUniqID can be 'all' to resolve all quests at once
    // gets the status and triggers resolutions if the specific quest is completed for the authenticated user 
  })


// PROGRESSION

export const progressionRoutes = new Elysia({ prefix: "/progression", tags: ["progression"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /progression/:userID --> get the progression of a user | user-only (can only get own progression) | admin can get any user's progression
  .get("/:userID", ({ params }) => {
    const { userID } = params;
    // get the progression of a user 
  })

  // POST /progression/:userID --> update the progression of a user | user-only (can only update own progression) | admin can update any user's progression
  .post("/:userID", ({ params }) => {
    const { userID } = params;
    // update the progression of a user 
  })

  // DELETE /progression/:userID --> reset the progression of a user | user-only (can only reset own progression) | admin can reset any user's progression
  .delete("/:userID", ({ params }) => {
    const { userID } = params;
    // reset the progression of a user 
  })


  
// SYSTEM

export const systemRoutes = new Elysia({ prefix: "/system", tags: ["system"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /system/blacklist  --> get all blacklisted users | admin-only
  .get("/blacklist", () => {
    // get all blacklisted users 
  })

  // GET /system/blacklist/:userID --> get if a user is blacklisted | admin-only
  .get("/blacklist/:userID", ({ params }) => {
    const { userID } = params;
    // get if a user is blacklisted 
  })

  // POST /system/blacklist/:userID --> add a user to the blacklist | admin-only
  .post("/blacklist/:userID", ({ params }) => {
    const { userID } = params;
    // add a user to the blacklist 
  })

  // DELETE /system/blacklist/:userID --> remove a user from the blacklist | admin-only
  .delete("/blacklist/:userID", ({ params }) => {
    const { userID } = params;
    // remove a user from the blacklist 
  })


  // PREMIUM




  

