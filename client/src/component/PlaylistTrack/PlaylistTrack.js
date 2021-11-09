import axios from "axios";
import React from "react";

export default function PlaylistTrack(props) {
  const { artist, track, trackID, updatePlaylist, setCurrentTrack } = props;

  const handleDeleteButton = (id) => {
    console.log(id);
    axios.delete(`http://localhost:8080/playlist/${id}`).then(() => {
      updatePlaylist();
    });
  };
  const handlePlayButton = (id) => {
    axios.get(`http://localhost:8080/playlist/${id}`).then((response) => {
      setCurrentTrack(response.data)
    })
  }
  return (
    <div className="playlist">
      <div className="playlist__space-between">
        <p className="playlist__item">
          {artist} - {track}
        </p>
        <div className="playlist__button-box">
          <button className="playlist__button" onClick={() => handlePlayButton(trackID)}>&#9658;</button>
          <button className="playlist__button" onClick={() => handleDeleteButton(trackID)}>&times;</button>
        </div>
      </div>
    </div>
  );
}
