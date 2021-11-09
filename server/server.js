const express = require("express");
const app = express();
const cors = require("cors");
const gifs = require("./data/gifs.json");
const axios = require("axios");
const apiKeyMusixMatch = "hidden";
const apiKeyEmotionAnalyzer ="hidden";
const apiKeyYoutube = "hidden";
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const getSimpsonsGifLink = (mood) => {
  const gifArray = gifs[mood];
  const randomIndex = Math.floor(Math.random() * gifArray.length);
  return gifArray[randomIndex];
};

app.use(express.json());
app.use(cors());

// app.post("/", (req, res) => {
//   const info = {
//     artist: "Adele",
//     track: "Hello",
//     mood: "sadness",
//     image: getSimpsonsGifLink("sadness"),
//     youtubeId: "aiebq2ZG5u8",
//   };
//   res.json(info);
// });

app.post("/", (req, res) => {
  let info = {};
  let artistName = req.body.artist;
  let trackName = req.body.track;
  artistName = artistName.trim().replace(" ", "%20");
  trackName = trackName.trim().replace(" ", "%20");
  axios
    .get(
      `https://api.musixmatch.com/ws/1.1/track.search?format=json&callback=callback&q_track=${trackName}&q_artist=${artistName}&f_has_lyrics=1&s_artist_rating=desc&s_track_rating=desc&quorum_factor=1&page_size=1&${apiKeyMusixMatch}`
    )
    .then((response) => {
      if (response.data.message.body.track_list.length === 0) {
        info.error = "Error: please try another song";
        res.json(info);
        return;
      }

      const trackID = response.data.message.body.track_list[0].track.track_id;
      const trackName =
        response.data.message.body.track_list[0].track.track_name;
      const artistName =
        response.data.message.body.track_list[0].track.artist_name;
      info.track = trackName;
      info.artist = artistName;
      axios
        .get(
          `https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=json&callback=callback&track_id=${trackID}&${apiKeyMusixMatch}`
        )
        .then((response) => {
          const lyrics = response.data.message.body.lyrics.lyrics_body;
          // console.log(lyrics);

          if (!lyrics) {
            info.error = "Error: please try another song";
            res.json(info);
            return;
          }

          const options = {
            method: "GET",
            url: "https://api.twinword.com/api/emotion/analyze/latest/",
            params: {
              text: lyrics,
            },
            headers: {
              host: "api.twinword.com",
              "x-twaip-key": apiKeyEmotionAnalyzer,
            },
          };

          axios.request(options).then((response) => {
            const emotion = response.data.emotions_detected[0];
            info.mood = emotion;

            if (!emotion) {
              info.error = "Error: song is not emotional enough for analysis";
              res.json(info);
              return;
            }
            axios
              .get(
                `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${artistName}%20${trackName}&safeSearch=none&key=${apiKeyYoutube}`
              )
              .then((response) => {
                const youtubeId = response.data.items[0].id.videoId;
                info.youtubeId = youtubeId;
                info.image = getSimpsonsGifLink(info.mood);
                res.json(info);
              });
          });
        });
    });
});

app
  .route("/playlist")
  .get((_req, res) => {
    const playlistData = fs.readFileSync("./data/playlist.json");
    const parsedPlaylist = JSON.parse(playlistData);
    const { playlist } = parsedPlaylist;
    res.json(playlist);
  })
  .post((req, res) => {
    const playlistData = fs.readFileSync("./data/playlist.json");
    const parsedPlaylist = JSON.parse(playlistData);
    const { playlist } = parsedPlaylist;

    const newPlaylistTrack = {
      artist: req.body.artist,
      track: req.body.track,
      mood: req.body.mood,
      image: req.body.image,
      youtubeId: req.body.youtubeId,
      trackID: uuidv4(),
    };

    playlist.push(newPlaylistTrack);

    fs.writeFileSync("./data/playlist.json", JSON.stringify(parsedPlaylist));

    res.json(playlist);
  });

app.delete("/playlist/:trackID", (req, res) => {
  console.log("delete");
  const trackID = req.params.trackID;

  const playlistData = fs.readFileSync("./data/playlist.json");
  const parsedPlaylist = JSON.parse(playlistData);
  let { playlist } = parsedPlaylist;
  parsedPlaylist.playlist = playlist.filter(
    (track) => track.trackID !== trackID
  );

  fs.writeFileSync("./data/playlist.json", JSON.stringify(parsedPlaylist));

  res.json(playlist);
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});

app.get("/playlist/:trackID", (req, res) => {
  const trackID = req.params.trackID
  const playlistData = fs.readFileSync("./data/playlist.json");
  const parsedPlaylist = JSON.parse(playlistData);
  let { playlist } = parsedPlaylist;
  const selectedTrack = playlist.find(
    (track) => track.trackID === trackID
  );

  res.json(selectedTrack);

})