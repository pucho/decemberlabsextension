import React, { Component, Fragment } from "react";
import "./App.css";

import axios from "axios";

class App extends Component {
  state = {
    loaded: false
  };
  componentDidMount() {
    this.getWeather();
  }

  getWeatherByCoords = (latitude, longitude) => {
    axios
      .get(`http://api.openweathermap.org/data/2.5/weather`, {
        params: {
          appid: process.env.REACT_APP_WEATHER_API_KEY,
          lat: latitude,
          lon: longitude,
          units: "metric"
        },
        timeout: 5000
      })
      .then(response => {
        const { main, weather } = response.data;
        this.setState({
          temperature: main.temp,
          ...weather[0],
          loaded: true
        });
      })
      .catch(error => {
        this.setState({
          timeout: true
        });
        console.log(error);
      });
  };

  getWeather = () => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      this.getWeatherByCoords(latitude, longitude);
    });
  };

  searchByAddress = () => {
    if (this.state.searchTerm) {
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${
            this.state.searchTerm
          }&key=${process.env.REACT_APP_GEOCODING_API_KEY}`
        )
        .then(response => {
          const { results } = response.data;
          console.log(results[0].formatted_address);
          if (results) {
            const { lat, lng } = results[0].geometry.location;
            this.getWeatherByCoords(lat, lng);
            this.setState({ searchAddress: results[0].formatted_address });
          }
        });
    }
  };

  statusAlert = () => {
    if (this.state.loaded) {
      return null;
    } else if (this.state.timeout) {
      return (
        <Fragment>
          <div>Connection to the server timed out, try again later</div>
          <input
            type="button"
            value="Try again"
            onClick={() => {
              window.location.reload();
            }}
          />
        </Fragment>
      );
    } else {
      return <div>Loading...</div>;
    }
  };

  render() {
    return (
      <div className="App">
        {!this.state.loaded && this.statusAlert()}
        {this.state.loaded && (
          <Fragment>
            <img
              src={`http://openweathermap.org/img/w/${this.state.icon}.png`}
              alt=""
            />
            <div>
              {this.state.temperature}°C {this.state.main}
            </div>
            <form>
              <input
                type="text"
                placeholder="Address"
                onChange={e => {
                  this.setState({ searchTerm: e.target.value });
                }}
              />
              <button
                onSubmit={e => {}}
                onClick={e => {
                  e.preventDefault();
                  this.searchByAddress();
                }}
              >
                Go
              </button>
            </form>

            {this.state.searchAddress && (
              <div>Weather @ {this.state.searchAddress}</div>
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default App;
