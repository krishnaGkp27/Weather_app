const API_KEY = "1f172d8444b8a09b23def535e3d8a3bf";
const CITY = "Delhi";
const weekDay = ["Sun", "mon", "tue", "wed", "Thu", "Fri", "Sat"];

const getCurrentWeatherData = async () => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const getHourlyForecastData = async () => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const formatTemperature  = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`

const loadCurrentForecast = ({ name, main: { temp, temp_max, temp_min }, weather: [{ description }] }) => {


    //console.log(weather);   
    const currentForecastElement = document.querySelector("#current-forecast");
    currentForecastElement.querySelector(".city").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemperature(temp);
    currentForecastElement.querySelector(".description").textContent = description;
    currentForecastElement.querySelector(".min-max-temp").textContent = `H: ${formatTemperature(temp_max)} L: ${formatTemperature(temp_min)}`;
    // <article id="current-forecast">
    //         <h1>City Name</h1>
    //         <p class="temp">temp</p>
    //         <p class="description">Description</p>
    //         <p class="min-max-temp">high low</p>
    //     </article>
}

const loadHourlyForecast = (hourlyForecast) => {
    let dataFor12Hours = hourlyForecast.slice(1,13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTML = ``;

    for(let {temp, icon, dt_txt} of dataFor12Hours)
    {
        innerHTML += `<article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img class="icon" src="${createIconUrl(icon)}">
        <p class="hourly-temp">${formatTemperature(temp)}</p>
        </article>`
    }
    hourlyContainer.innerHTML = innerHTML;
}
const getHourlyForecast = async(city)=>{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();
  //  console.log(data);
  //  console.log(data.list);
    return data.list.map(forecast =>{
        const { main : {temp, temp_max, temp_min}, dt, dt_txt, weather: [{description, icon}]} = forecast;
        return {temp, temp_max, temp_min, dt, dt_txt, description, icon}
    })
}

const loadFiveDayForecast = (hourlyForecast) => {

    console.log(hourlyForecast);
    let minTemp = new Map();
    let maxTemp = new Map();
    let iconText = new Map();
    hourlyForecast.forEach(element => {
        const { dt_txt, temp_max, temp_min, icon } = element;
        const dayOfTheWeek = (new Date(dt_txt.split(" ")[0])).getDay();

        iconText.set(dayOfTheWeek,icon)
        if (minTemp.has(dayOfTheWeek))
        {
            let currentMinTemp = Math.min(minTemp.get(dayOfTheWeek), temp_min);
            minTemp.set(dayOfTheWeek,currentMinTemp);
        }
        else
            minTemp.set(dayOfTheWeek,temp_min); 
    
        if (maxTemp.has(dayOfTheWeek))
        {
            let currentMaxTemp = Math.max(maxTemp.get(dayOfTheWeek), temp_max);
            maxTemp.set(dayOfTheWeek,currentMaxTemp);
        }
        else
            maxTemp.set(dayOfTheWeek,temp_max); 
    });
    const fiveDayforecastContainer = document.querySelector(".five-day-forecast-container");
    let dayWiseInfo = ``;
    const todayDay = (new Date()).getDay();
    let iterator = todayDay;
    while (iterator + 1 != todayDay)
    {
        dayWiseInfo += `
        <article class="day-wise-forecast">
                    <h2 class="day">${iterator === todayDay ? "Today" : weekDay[iterator]}</h2>
                    <img src="${createIconUrl(iconText.get(iterator))}" alt="" class="icon">
                    <p class="min-temp">${formatTemperature(minTemp.get(iterator))}</p>
                    <p class="max-temp">${formatTemperature(maxTemp.get(iterator))}</p>
                </article>`;
        iterator = (iterator + 1) % weekDay.length;
    }
    fiveDayforecastContainer.innerHTML = dayWiseInfo;
    console.log(minTemp);
    console.log(maxTemp);
}

const loadFeelsLike = ({ main : { feels_like }})=>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like);
}

const loadhumidity = ({ main : {humidity}})=>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = humidity+"%";
}

// const load
const contentLoaded = async () => {
    const currentWeather = await getCurrentWeatherData();
   // const hourlyForecastData = await getHourlyForecast();
    const hourlyForecastData = await getHourlyForecast(CITY);
    loadCurrentForecast(currentWeather);
    loadHourlyForecast(hourlyForecastData);
    loadFiveDayForecast(hourlyForecastData);
    loadFeelsLike(currentWeather);
    loadhumidity(currentWeather);

   // loadForecastData(hourlyForecastData);

}
document.addEventListener("DOMContentLoaded", contentLoaded);