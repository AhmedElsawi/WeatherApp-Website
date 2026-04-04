let weather = {
  apiKey: "e68fc2173b1f17a39736e1da8db28f21",

  // STATE
  unit: "imperial",
  debounceTimer: null,

  // UNIT
  getTempUnit() {
    return this.unit === "imperial" ? "°F" : "°C";
  },

  getSpeedUnit() {
    return this.unit === "imperial" ? "mph" : "m/s";
  },

  async getDefaultLocation() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return data.city || "New York";
    } catch {
      return "New York";
    }
  },

  async init() {
    const city = await this.getDefaultLocation();

    document.querySelector(".search-bar").value = city;

    const results = await this.geocodeLocation(city);

    if (results.length > 0) {
      this.selectLocation(results[0]); 
    }
  },


  geocodeLocation(query) {
    return fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&lang=en&limit=5&appid=${this.apiKey}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Geocode failed");
        return res.json();
      })
      .catch(() => []);
  },


  fetchWeatherByCoords(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${this.unit}&lang=en&appid=${this.apiKey}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Weather failed");
        return res.json();
      })
      .then((data) => this.displayWeather(data))
      .catch(() => alert("Weather fetch failed"));
  },

  getForecastByCoords(lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${this.unit}&lang=en&appid=${this.apiKey}`
    )
      .then((res) => res.json())
      .then((data) => this.displayForecast(data));
  },


  async search() {
    const query = document.querySelector(".search-bar").value.trim();
    if (!query) return;

    const sug = document.querySelector(".suggestions");
    if (sug) sug.remove();

    const results = await this.geocodeLocation(query);

    if (!results.length) {
      alert("No location found.");
      return;
    }

    if (results.length === 1) {
      this.selectLocation(results[0]);
    } else {
      this.showLocationPicker(results);
    }
  },


  selectLocation(location) {
    this.currentLocation = location; 

    const name = `${location.name}, ${location.state || ""} ${location.country}`;

    document.querySelector(".city").innerText = "Weather in " + name;

    this.fetchWeatherByCoords(location.lat, location.lon);
    this.getForecastByCoords(location.lat, location.lon);

    const picker = document.querySelector(".location-picker");
    if (picker) picker.remove();
  },


  showLocationPicker(locations) {
    const old = document.querySelector(".location-picker");
    if (old) old.remove();

    const container = document.createElement("div");
    container.className = "location-picker";

    locations.forEach((loc) => {
      const btn = document.createElement("button");
      btn.innerText = `${loc.name}, ${loc.state || ""} ${loc.country}`;

      btn.onclick = () => this.selectLocation(loc);

      container.appendChild(btn);
    });

    document.querySelector(".weather").prepend(container);
  },


  handleTyping() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(async () => {
      const query = document.querySelector(".search-bar").value.trim();
      if (query.length < 2) return;

      const results = await this.geocodeLocation(query);
      if (results.length) this.showSuggestions(results);
    }, 300);
  },

  showSuggestions(locations) {
    const old = document.querySelector(".suggestions");
    if (old) old.remove();

    const container = document.createElement("div");
    container.className = "suggestions";

    locations.slice(0, 5).forEach((loc) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerText = `${loc.name}, ${loc.state || ""} ${loc.country}`;

      item.onclick = () => {
        document.querySelector(".search-bar").value = loc.name;
        this.selectLocation(loc);
        container.remove();
      };

      container.appendChild(item);
    });

    document.querySelector(".search").appendChild(container);
  },

  // UI
  displayWeather(data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src =
      "https://openweathermap.org/img/wn/" + icon + ".png";

    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText =
      Math.round(temp) + this.getTempUnit();

    document.querySelector(".humidity").innerText =
      "Humidity: " + humidity + "%";

    document.querySelector(".wind").innerText =
      "Wind speed: " + speed + " " + this.getSpeedUnit();

    document.querySelector(".weather").classList.remove("loading");
  },

  displayForecast(data) {
    const container = document.querySelector(".forecast-container");
    container.innerHTML = "";

    const daily = {};

    data.list.forEach((item) => {
      const date = item.dt_txt.split(" ")[0];
      if (item.dt_txt.includes("12:00:00") && !daily[date]) {
        daily[date] = item;
      }
    });

    Object.values(daily)
      .slice(0, 5)
      .forEach((day) => {
        const div = document.createElement("div");
        div.className = "forecast-item";

        const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
          weekday: "short",
        });

        div.innerHTML = `
          <span>${date}</span>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
          <span>${Math.round(day.main.temp)}${this.getTempUnit()}</span>
        `;

        container.appendChild(div);
      });
  },
};


document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".search-btn").addEventListener("click", () => {
    weather.search();
  });

  document.querySelector(".search-bar").addEventListener("keyup", (e) => {
    if (e.key === "Enter") weather.search();
  });

  document.querySelector(".unit-select").addEventListener("change", function () {
    weather.unit = this.value;

    if (weather.currentLocation) {
    weather.fetchWeatherByCoords(
      weather.currentLocation.lat,
      weather.currentLocation.lon
    );

    weather.getForecastByCoords(
      weather.currentLocation.lat,
      weather.currentLocation.lon
    );
  }
});

  document.querySelector(".search-bar").addEventListener("input", () => {
    weather.handleTyping();
  });

  weather.init();
});
