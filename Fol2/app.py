from fastapi import FastAPI, Query, Header
import requests

app = FastAPI()

BASE_URL = "http://20.244.56.144/test/companies"

COMPANIES = ["AMZ", "FLP", "SNP", "WYN", "AZO"]
CATEGORIES = [
    "Phone",
    "Computer",
    "TV",
    "Earphone",
    "Tablet",
    "Charger",
    "Mouse",
    "Keypad",
    "Bluetooth",
    "Pendrive",
    "Remote",
    "Speaker",
    "Headset",
    "Laptop",
    "PC",
]

# Your access token
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzEyMTQ5Njc1LCJpYXQiOjE3MTIxNDkzNzUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImM3ZDk0NzJiLWIxYmYtNGFjYy1iMjNjLTZhZDJhZDljMjhjOSIsInN1YiI6ImF6NDA1OEBzcm1pc3QuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiQ29kZU9QVCIsImNsaWVudElEIjoiYzdkOTQ3MmItYjFiZi00YWNjLWIyM2MtNmFkMmFkOWMyOGM5IiwiY2xpZW50U2VjcmV0IjoicU5KQmdHQ2FmTWRqb1lPQSIsIm93bmVyTmFtZSI6IkFha2FzaCIsIm93bmVyRW1haWwiOiJhejQwNThAc3JtaXN0LmVkdS5pbiIsInJvbGxObyI6IlJBMjExMTAzMzAxMDEzNSJ9.M4MKmqjvV5qlA1ITQK0vcUzdz_JqDBEGac6M7PiDwOk"


@app.get("/categories/{category_name}/products")
async def get_top_products(
    category_name: str,
    n: int = Query(10, gt=0, le=10),
    min_price: int = 1,
    max_price: int = 10000,
    page: int = 1,
    sort_by: str = None,
    order: str = None,
    authorization: str = Header(None),
):

    # Check if the request contains Authorization header
    if authorization is None:
        return {"error": "Unauthorized"}

    # Check if the authorization header starts with "Bearer" and the token is correct
    if (
        not authorization.startswith("Bearer ")
        or authorization[len("Bearer ") :] != ACCESS_TOKEN
    ):
        return {"error": "Invalid token"}

    category_name = category_name.capitalize()
    if category_name not in CATEGORIES:
        return {"error": "Invalid category name"}

    url = f"{BASE_URL}/{category_name}/products"
    params = {"top": n, "minPrice": min_price, "maxPrice": max_price}
    if page > 1:
        params["page"] = page
    if sort_by and order:
        params[sort_by] = order

    headers = {"Authorization": authorization}

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    for i, product in enumerate(data):
        product["productId"] = f"{category_name.lower()}-{i+1}"

    return data


@app.get("/categories/{category_name}/products/{product_id}")
async def get_product_details(category_name: str, product_id: str):
    category_name = category_name.capitalize()
    if category_name not in CATEGORIES:
        return {"error": "Invalid category name"}

    url = f"{BASE_URL}/{category_name}/products"
    response = requests.get(url)
    data = response.json()
    product = next((p for p in data if p["productId"] == product_id), None)

    if product:
        return product
    else:
        return {"error": "Product not found"}
