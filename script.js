let weather = {"apiKey": "e68fc2173b1f17a39736e1da8db28f21" ,

//weather 
fetchWeather: function(city) {
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + this.apiKey)
    .then((response) => response.json())
    .then((data) => this.displayWeather(data));
}, 

// weather display 
displayWeather: function(data){
    const { name } = data;
    const { icon, description} = data.weather[0];
    const {temp, humidity} = data.main;
    const{speed} = data.wind;
    document.querySelector(".city").innerText = "Weather in " + name;
    document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon +".png";
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp + "°F";
    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
    document.querySelector(".description").innerText = description;
    document.querySelector(".wind").innerText = "Wind speed: " + speed + " mph";
    document.querySelector(".weather").classList.remove("loading");
}, 

//forecast 
getForecast: function (city) {
    fetch("https://api.openweathermap.org/data/2.5/forecast?q=" 
        + city 
        + "&units=imperial&appid=" 
        + this.apiKey)
    .then((response) => response.json())
    .then((data) => this.displayForecast(data));
},

//forcast display
displayForecast: function (data) {
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
        div.classList.add("forecast-item");

        const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
          weekday: "short",
        });

        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);

        div.innerHTML = `
          <span>${date}</span>
          <img src="https://openweathermap.org/img/wn/${icon}.png">
          <span>${temp}°F</span>
        `;

        container.appendChild(div);
      });
  },

//search 
search: function(){
  this.fetchWeather(document.querySelector(".search-bar").value);
  this.getForecast(document.querySelector(".search-bar").value);
},
};

// event listeners
document.querySelector(".search button").addEventListener("click", function() {
weather.search();
});

document.querySelector(".search-bar").addEventListener("keyup" , function (event){
    if (event.key == "Enter" ){
        weather.search();
    }
});

// load 
weather.fetchWeather("Bellingham");
weather.getForecast("Bellingham");




