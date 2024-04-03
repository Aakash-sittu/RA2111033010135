const express = require('express');
const axios = require('axios');
const app = express();

const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http://20.244.56.144/test/rand";

const numberWindow = [];

app.get("/numbers/:number_id", async (req, res) => {
    const numberId = req.params.number_id;

    try {
        const response = await axios.get(`${TEST_SERVER_URL}?number_id=${numberId}`);
        const numbers = response.data;

        numbers.forEach(number => {
            if (!numberWindow.includes(number)) {
                numberWindow.push(number);
                if (numberWindow.length > WINDOW_SIZE) {
                    numberWindow.shift();
                }
            }
        });

        const avg = numberWindow.length > 0 ? numberWindow.reduce((a, b) => a + b, 0) / numberWindow.length : 0;

        const response_data = {
            numbers: numbers,
            windowPrevState: numberWindow.slice(0, Math.max(0, numberWindow.length - numbers.length)),
            windowCurrState: numberWindow,
            avg: avg
        };

        res.json(response_data);
    } catch (error) {
        res.status(503).json({ detail: "Failed to fetch numbers from the test server." });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
