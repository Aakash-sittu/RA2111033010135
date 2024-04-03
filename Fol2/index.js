const express = require('express');
const axios = require('axios');

const app = express();

const BASE_URL = "http://20.244.56.144/test/companies";
const COMPANIES = ["AMZ", "FLP", "SNP", "WYN", "AZO"];
const CATEGORIES = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth",
    "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

// Middleware to check authorization header
const checkAuthorization = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Here you can add logic to verify the access token if needed
    next();
};

app.get("/categories/:category_name/products", checkAuthorization, async (req, res) => {
    const { category_name } = req.params;
    const { n = 10, min_price = 1, max_price = 10000, page = 1, sort_by, order } = req.query;

    if (!CATEGORIES.includes(category_name)) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const url = `${BASE_URL}/${category_name}/products`;
    const params = { top: n, minPrice: min_price, maxPrice: max_price, page: page, sort_by: sort_by, order: order };

    try {
        const response = await axios.get(url, { params });
        const data = response.data;

        for (let i = 0; i < data.length; i++) {
            data[i].productId = `${category_name.toLowerCase()}-${i + 1}`;
        }

        res.json(data);
    } catch (error) {
        res.status(error.response.status).json({ error: 'Error fetching data from external API' });
    }
});

app.get("/categories/:category_name/products/:product_id", async (req, res) => {
    const { category_name, product_id } = req.params;

    if (!CATEGORIES.includes(category_name)) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const url = `${BASE_URL}/${category_name}/products`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        const product = data.find(p => p.productId === product_id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(error.response.status).json({ error: 'Error fetching data from external API' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
