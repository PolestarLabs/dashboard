const express = require('express');
const router = express.Router();
const axios = require("axios");
const geniusLyricsApi = require("genius-lyrics-api");
const lyricsFinder = require('lyrics-finder');
const creds = require("../../../config.js").genius;

router.get('/lyrics', async (req,res)=>{
    

    let resp = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(req.query.q+" "+(req.query.a||""))}`,{
        headers: {"Authorization": `Bearer ${creds.token}`}
    }).catch(err=>null);
    


    const song = resp.data?.response?.hits?.[0]?.result;
    
    if (!song) return res.status(401).json("No Lyrics Found");
    const songSlim = {
        id: song.id,
        img: song.header_image_url,
        title: song?.title,
        artist: song.primary_artist?.name,
        url: song?.url,        
    }
 
    //let lyrics = await geniusLyricsApi.getLyrics(options);//.catch(e=>null);
    let lyrics = await lyricsFinder(req.query.a||songSlim.artist, songSlim.title);
   
    songSlim.lyrics = lyrics


    return res.status(200).json(songSlim)
})

module.exports = router