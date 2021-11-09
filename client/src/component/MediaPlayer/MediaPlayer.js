import React, { createRef, useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/logo/NClogo.png";
import PlaylistTrack from "../PlaylistTrack/PlaylistTrack";

export default function MediaPlayer() {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/playlist").then((response) => {
      setPlaylist(response.data);
    });
  }, []);

  const updatePlaylist = () => {
    console.log("update playlist");
    axios.get("http://localhost:8080/playlist").then((response) => {
      console.log(response.data);
      setPlaylist(response.data);
    });
  };

  const formRef = createRef();

  const handleClick = () => {
    const form = formRef.current;

    if (!form.artist.value.trim()) {
      alert("Please enter an artist!");
      return;
    }
    if (!form.track.value.trim()) {
      alert("Please enter a track!");
      return;
    }

    const searchQuery = {
      artist: form.artist.value,
      track: form.track.value,
    };
    axios.post(`http://localhost:8080/`, searchQuery).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
        return;
      }
      setCurrentTrack(response.data);

    });

    form.reset();
  };


  const handledEnterKey = (e) => {
    if (e.key === 'Enter') {
      handleClick()
    }
  }


  const handleAddToPlaylist = () => {
    axios.post("http://localhost:8080/playlist", currentTrack).then(() => {
      updatePlaylist();
    });
  };

  if (currentTrack) {
    return (
      <>
        <div className="media-player">
          <h4 className="media-player__track--small">
            Now Playing:
          </h4>
          <h4 className="media-player__track">
            {currentTrack.artist} - {currentTrack.track}
          </h4>
          <div className="media-player__play-button">
            <img
              className="media-player__image"
              src={currentTrack.image}
              alt="based on the music mood"
            />
            <iframe
              className="media-player__youtube"
              width="410"
              height="320"
              src={`https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=1&mute=0`}
              frameborder="0"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <h4 className="media-player__mood">
            mood detected: {currentTrack.mood}
          </h4>
          <button className="media-player__add-playlist-button" onClick={handleAddToPlaylist} >Add to playlist?</button>
          <form ref={formRef} className="media-player__form" autoComplete="off" onKeyPress={handledEnterKey}>
            <label className="media-player__label">Artist</label>
            <input className="media-player__search-input" name="artist" />
            <label className="media-player__label">Track</label>
            <input className="media-player__search-input" name="track" />
            <button
              className="media-player__search-button"
              onClick={handleClick}
              type="button"
            >
              🔍
            </button>
          </form>
        </div>
        {playlist.length > 0 && <div className="playlist__title--background"><p className="playlist__title">Playlist</p></div>}
        {playlist.length > 0 &&
          playlist.map((track) => (
            <PlaylistTrack
              key={track.trackID}
              updatePlaylist={updatePlaylist}
              {...track}
              setCurrentTrack={setCurrentTrack}
            />
          ))}
      </>
    );
  } else {
    return (
      <>
        <div className="media-player">
          <img className="media-player__logo" src={logo} alt="logo"></img>
          <div className="media-player__play-button"></div>
          <form ref={formRef} className="media-player__form" autoComplete="off" onKeyPress={handledEnterKey}>
            <label className="media-player__label">Artist</label>
            <input className="media-player__search-input" name="artist" />
            <label className="media-player__label">Track</label>
            <input className="media-player__search-input" name="track" />
            <button
              className="media-player__search-button"
              onClick={handleClick}
              type="button"
            >
              🔍
            </button>
          </form>
        </div>
        {playlist.length > 0 && <div className="playlist__title--background"><p className="playlist__title">Playlist</p></div>}
        {playlist.length > 0 &&
          playlist.map((track) => (
            <PlaylistTrack
              key={track.id}
              updatePlaylist={updatePlaylist}
              {...track}
              setCurrentTrack={setCurrentTrack}
            />
          ))}
      </>
    );
  }
}
