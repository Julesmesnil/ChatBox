import React, { useEffect, useState } from 'react';

import settings from './assets/settings.png';
import img from './assets/img.png';
import logoutIcon from './assets/logoutImg.png';
import fond1 from './assets/fonds/fond1.jpg';
import fond2 from './assets/fonds/fond2.jpg';
import fond3 from './assets/fonds/fond3.jpg';

import './App.css';
import { io } from 'socket.io-client';

import User from './User';
import ThreadMessages from './ThreadMessages';
import InputName from './InputName';
import InputNameForm from './InputNameForm';
import InputMessage from './InputMessage';
import axios from 'axios';


function App() {

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [spotifyUser, setSpotifyUser] = useState([]);
  const [socket, setSocket] = useState(null);

  const CLIENT_ID = "267dee8acb604afd81a5b1464a34b77a"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("");
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const newSocket = io("https://whispering-chamber-09886.herokuapp.com/");
    setSocket(newSocket);
    return () => newSocket.close();
  }, [setSocket]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);

    const { data } = axios.get("https://api.spotify.com/v1/playlists/2iYIoic1SsHMh4FLM9lEMU/tracks", {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json'
      },
    })
      .then((response) => {
        console.log(response);
        { response.data.items ? setPlaylist(response.data.items) : console.log("no items") }
      });

    const { userData } = axios.get("https://api.spotify.com/v1/users/31zbcrw3soubvcdiyaljy5zen2wm", {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-type': 'application/json'
      },
    })
      .then((response) => {
        console.log(response);
        { response.data ? setSpotifyUser(response.data) : console.log("no user") };
        { spotifyUser ? console.log(spotifyUser) : console.log("no user") };
      })
  }, []);


  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  useEffect(() => {
    if (socket) {
      const getMessages = (messages) => {
        setMessages((messages));
      };

      const getUsers = (users) => {
        setUsers((users));
      };

      const getNewUser = (user) => {
        setUsers(prevUsers => {
          return [...prevUsers, user];
        });
      };

      const updateUser = (user) => {
        setUsers(prevUsers => {
          prevUsers[user.id] = user;
          return prevUsers;
        });
      };

      const deleteUser = (userId) => {
        setUsers(prevUsers => {
          return prevUsers.filter(user => user.id !== userId);
        });
      };

      socket.on("messages", getMessages);
      socket.on("message", message => setMessages(
        prevMessages => [...prevMessages, message]
      ))
      socket.emit("getMessages");

      socket.on('users', getUsers);
      socket.on('userConnection', getNewUser);
      socket.on('updateUsername', updateUser);
      socket.on('deleteUser', deleteUser);
      socket.emit('getUsers');
    }
  }, [socket]);

  return (
    <div className="App Conteneur">
      <div className='left'>

      </div>
      <div className='center'>
        <div className='headerMid'>
          {socket ? (
            <>
              <ThreadMessages messages={messages} socket={socket} />
            </>)
            :
            (<div>Not connected</div>)}
          <InputMessage socket={socket} />
        </div>
      </div>

      <div className='right'>
        <div className='partie-haute'>
          <div className="small-profile">
            <div className="profile">
              <img className="profile-picture" src={spotifyUser.images[0].url} alt="profile" />
            </div>
            <div className="profile-name">
              {<InputName socket={socket} spotifyUser={spotifyUser} />}
            </div>

          </div>
          <div className="tools">
            <div class="dropdown">
              <img className="settings-icon" onClick={logout} src={settings} />
              <div class="dropdown-content">
                {<InputNameForm socket={socket} spotifyUser={spotifyUser} />}
              </div>
            </div>

            <div class="dropdown">
              <img className="img-icon" src={img} />
              <div class="dropdown-content">
                <img className="fond1" src={fond1} />
                <img className="fond2" src={fond2} />
                <img className="fond3" src={fond3} />
              </div>
            </div>
            {!token ?
              <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
                <img className="logout-icon" onClick={logout} src={logoutIcon}></img>
              </a>
              : <img className="logout-icon" onClick={logout} ></img>}
          </div>

        </div>

        <div className='partie-basse'>
          {socket ? (
            <>
              <User users={users} />
            </>)
            :
            (<div>Not connected</div>)}

        </div>

        <div className='partie-son'>

        </div>

      </div>

    </div>
  );
}

export default App;
