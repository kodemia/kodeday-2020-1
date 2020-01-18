import React, { Component } from 'react';
import './App.css';
import logo from './white.png';

const baseEndpoint = 'https://accounts.spotify.com';
const giphyEnpoint = 'https://api.giphy.com/v1/gifs/search?'

const giphyClientID = "GIPHY_CLIENT_ID";
const spotifyClientID = "SPOTIFY_CLIENT_ID";
const redirectUri = "http://localhost:3000";

const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "streaming",
  "user-read-email",
  "user-read-private"
];

const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce((initial, item) => {
    var parts = item.split("=");
    initial[parts[0]] = decodeURIComponent(parts[1]);
    return initial;
  }, {});
// window.location.hash = ""

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchValue: null,
      spotifyToken: null,
      spotifySoundKey: null,
      giphyURL: null,
    }
  }

  componentDidMount() {
    let _token = hash.access_token
    if (_token) {
      this.setState({
        spotifyToken: _token
      });
    }
  }

  renderPlayer = (spotifySoundKey, giphyURL) => {
    const { searchValue } = this.state
    return (
      <div className="main-container">
        <h1>Encontramos...</h1>
        <iframe
          src={`https://embed.spotify.com/?uri=spotify:track:${spotifySoundKey}&autoplay=1`}
          width="400"
          height="100"
          frameBorder="0"
          allowTransparency="true"
          allow="encrypted-media"
        >
        </iframe>
        <picture>
          <img className="giphy" src={`${giphyURL}`} />
        </picture>

        <button
          className="back-button"
          onClick={this.onClickBackButton}
        >
          Back
        </button>

      </div>
    )
  }

  renderSearch = () => (
    <div className="main-container">
      <picture>
        <img className="logo" src={logo} />
      </picture>
      <h1>Kodeparty</h1>
      <input
        onKeyDown={this.onKeyDownHandler}
        placeholder="Search"
      />
      <br />
      <label>
        Press enter key...
      </label>
    </div>
  )

  renderLogin = () => (
    <div className="main-container">
      <picture>
        <img className="logo" src={logo} />
      </picture>
      <a
        href={`${baseEndpoint}/authorize?client_id=${spotifyClientID}&redirect_uri=${redirectUri}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`}
      >
        Login
      </a>
    </div>
  )

  fetchSearchWord = word => {
    const { spotifyToken } = this.state
    fetch(
      `https://api.spotify.com/v1/search?q=${word}&type=track&limit=1`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${spotifyToken}`,
        }
      }
    )
      .then(response => response.json())
      .then(data => {
        console.log(data);

        this.setState({
          spotifySoundKey: data.tracks.items[0].id
        })
      })
    fetch(
      `${giphyEnpoint}api_key=${giphyClientID}&q=${word}&limit=1&rating=G&lang=es`
    )
      .then(data => data.json())
      .then(res => {
        let giphy = res.data[0].images.original.webp
        this.setState({
          giphyURL: giphy
        })
      })
  }

  onKeyDownHandler = ({ key, target }) => {
    if (key === 'Enter') {
      const { value } = target
      this.setState({
        searchValue: value
      }, () => {
        this.fetchSearchWord(value)
      })
    }
  }

  onClickBackButton = () => {
    this.setState({
      searchValue: null,
      spotifySoundKey: null,
      giphyURL: null
    })
  }

  render() {
    const { searchValue, spotifyToken, spotifySoundKey, giphyURL } = this.state
    console.log(searchValue, spotifyToken)

    return (
      <div className="App">
        <div className="app-container">
          {!spotifyToken && this.renderLogin()}
          {spotifyToken && !searchValue && this.renderSearch()}
          {
            spotifyToken &&
            searchValue &&
            spotifySoundKey &&
            giphyURL &&
            this.renderPlayer(spotifySoundKey, giphyURL)
          }
        </div>
      </div>
    )
  }
}

export default App;
