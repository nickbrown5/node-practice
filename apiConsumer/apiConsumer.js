import axios from 'axios';
import fs from 'fs';

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.weather.gov/points/29.791404,-95.827029',
    headers: { }
};

let forecastUrl = '';

axios.request(config)
.then((response) => {
    forecastUrl = response.data.properties.forecast;
    config.url = forecastUrl;
    return axios.request(config)
        .then((response) => {
            const periods = response.data.properties.periods;
            let forecast = {};
            periods.forEach((period) => {
                forecast[period.name.split(' ').join('_')] = {
                    temperature: period.temperature,
                    temperatureUnit: period.temperatureUnit,
                    windSpeed: period.windSpeed,
                    windDirection: period.windDirection,
                    shortForecast: period.shortForecast
                };
            });
            console.log(forecast);
            fs.writeFile('forecast.json', JSON.stringify(forecast, null, 2), (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('Forecast data saved to forecast.json');
                }
            });
        })
        .catch((error) => {
            console.log(error);
        });
})
.catch((error) => {
    console.log(error);
});
