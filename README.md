# CRUDS - Product Management System

A small product management app I built with plain HTML, CSS and JavaScript. You can add products, edit them, delete them, search, sort and export everything to a CSV file. All the data is saved in your browser, so there is no server or database to set up.

## Features

- Create, read, update and delete products
- Each product has a permanent ID that never changes
- The total per unit (price + taxes + ads - discount) updates live while you type
- Quantity is stored as a Qty column instead of making duplicate rows
- Form validation with an error message under each field
- Edit mode with a Cancel button (Esc also cancels)
- Search by title or by category
- Sort by clicking the column headers (ID, title, price, total, qty, category), with a sort dropdown on phones
- Pagination with 10 products per page
- Summary cards for total products, units in stock and inventory value
- Export to CSV (works with Arabic text in Excel)
- Confirmation before deleting one product or all of them
- Toast messages after create, update and delete
- Dark and light theme that remembers your choice
- Responsive layout, the table turns into cards on small screens

## Tech Stack

- HTML
- CSS (custom properties for the theme colors)
- Vanilla JavaScript
- localStorage

## How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/Markehab1/Product-management-system-CRUDS-.git
   ```
2. Open `index.html` in your browser.

That's it, no install needed. You can also open the folder in VS Code and use the Live Server extension if you like.

## How to Use

- Fill in the title, price, taxes, ads, discount, quantity and category, then press **Create**.
- Title, price and category are required. Quantity has to be a whole number from 1 to 1000, and the discount can't be bigger than price + taxes + ads.
- Press **Update** on a row to load it into the form, change what you want and press **Update** again. Press **Cancel** or Esc to stop editing.
- Press **Delete** to remove one product, or **Delete All** to remove all of them. You will be asked to confirm first.
- Type in the search box to filter. Use the buttons under it to switch between searching by title and by category.
- Click a column header to sort, and click it again to flip the order.
- Press **Export CSV** to download all products as `products.csv`.
- Use the button at the top right to switch between dark and light mode.

## Where the Data Is Stored

Everything is kept in your browser's localStorage:

| Key | What it holds |
| --- | --- |
| `cruds.products.v2` | The list of products |
| `cruds.nextId` | The next ID to give a new product |
| `cruds.theme` | Your theme choice (`dark` or `light`) |

If you used the old version of the app, your products were saved under the key `product`. The app moves them to the new key the first time it opens, so nothing is lost.

Since the data lives in the browser, clearing your browser data will delete it, and it won't show up on another device.

## Project Structure

```
CRUDS/
├── index.html   page layout
├── style.css    styles and theme colors
├── main.js      app logic
└── README.md
```

## Roadmap

- A Node.js + Express API so the data is not tied to one browser
- Saving products in a real database
- Importing products from a CSV file

## Author

**Mark Ehab**

- Portfolio: [mark-ehab.vercel.app](https://mark-ehab.vercel.app/)
- GitHub: [@Markehab1](https://github.com/Markehab1)
