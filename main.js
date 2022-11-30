const API_KEY = "1f172d8444b8a09b23def535e3d8a3bf";
const CITY = "Delhi";
const weekDay = ["Sun", "mon", "tue", "wed", "Thu", "Fri", "Sat"];
let selectedCityText;
let selectedCity;

const getCitiesUsingGeoLocation = async (searchText) =>{
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${API_KEY}`);
    return response.json();
}
const getCurrentWeatherData = async ({ lat, lon, name :city }) => {
    const url = lat && lon ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric` : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    return response.json();
}

const getHourlyForecastData = async () => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`);
    return response.json();
}

const formatTemperature  = (temp) => `${temp?.toFixed(1)}°C`;
const createIconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`

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

const loadHourlyForecast = (currentWeater,hourlyForecast) => {
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
const getHourlyForecast = async (city) => {
    let { name } = selectedCity; 
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}&units=metric`);
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
}

const loadFeelsLike = ({ main : { feels_like }})=>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemperature(feels_like);
}

const loadhumidity = ({ main : {humidity}})=>{
    let container = document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent = humidity+"%";
}

const loadData = async() => {
    
    const currentWeather = await getCurrentWeatherData(selectedCity);
    loadCurrentForecast(currentWeather);
    const hourlyForecastData = await getHourlyForecast(currentWeather);
    loadHourlyForecast(currentWeather,hourlyForecastData);
    loadFiveDayForecast(hourlyForecastData);
    loadFeelsLike(currentWeather);
    loadhumidity(currentWeather);
}

function debounce(func) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
            console.log(this, args);
        }, 500);
    }
}

const onSearchChange = async (event) => {
    let { value } = event.target;
    if (!value) {
        selectedCity = null;
        selectedCityText = ""; 
    }
    if (value && (selectedCityText !== value)) {
    
        const listOfCities = await getCitiesUsingGeoLocation(value);
        let options = "";
        for (let { lat, lon, name, state, country } of listOfCities) {
            options += `<option data-city-details='${ JSON.stringify({ lat, lon, name })}' value = "${name}, ${state}, ${country}"></option>`;
        }
        document.querySelector("#cities").innerHTML = options;
        console.log(listOfCities);
    }
    
}

const debounceSearch = debounce((event) => onSearchChange(event));

const handleCitySelection = (event) => {
    console.log("Selection done");
    selectedCityText = event.target.value;
    console.log(selectedCityText);
    let options = document.querySelectorAll("#cities > option")
    console.log(options);
    if (options?.length) {
        let selectedOption = Array.from(options).find(opt => opt.value === selectedCityText);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log({ selectedCity });
    }
    loadData();
}
// const load
const contentLoaded = async () => {
    const searchInput = document.querySelector("#search");
    searchInput.addEventListener("input", debounceSearch);
    searchInput.addEventListener("change", handleCitySelection);

}
document.addEventListener("DOMContentLoaded", contentLoaded);