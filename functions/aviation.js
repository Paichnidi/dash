export async function handler(event) {
    const { type, icao } = event.queryStringParameters;

    if (!icao || !type) {
        return {
            statusCode: 400,
            body: "Missing parameters"
        };
    }

    const url =
        type === "metar"
            ? `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`
            : `https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`;

    const response = await fetch(url);

    const data = await response.text();

    return {
        statusCode: response.status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: data
    };
}