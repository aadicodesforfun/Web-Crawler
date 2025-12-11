# 🕷️ Async Node.js Web Crawler

This script is a robust, asynchronous web crawler designed to recursively traverse a target website, download all internal images, and manage concurrent requests safely.

## ✨ Features

* **Asynchronous Flow Control:** Uses `async`/`await` and `Promise.all()` to manage concurrent network requests for both page fetching and resource downloading, preventing system overload.
* **Dynamic URL Resolution:** Correctly handles relative, root-relative, and absolute links by resolving them against the current page's base URL.
* **Scope Filtering:** Only follows links that remain within the starting website's hostname to prevent external traversal.
* **Deduplication:** Uses a `seenURLs` set to ensure no page is processed more than once, preventing infinite loops.
* **Resource Management:** Downloads images using streams (`fs.createWriteStream`) and includes robust error handling for network and file system failures.
* **CLI Input:** Accepts the starting URL as a command-line argument.

## 🚀 Getting Started

### Prerequisites

You must have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1.  Clone the repo
2.  Install the dependencies:

    ```bash
    git clone https://github.com/aadicodesforfun/Web-Crawler.git
    npm i
    ```

### Dependencies

| Module | Purpose |
| :--- | :--- |
| `node-fetch` | Used for making HTTP requests (fetching web pages and images). |
| `cheerio` | Used to parse the HTML and traverse the DOM (like jQuery) to extract links and image sources. |

## ⚙️ How to Run the Crawler

The script takes one mandatory argument: the starting URL.

### Syntax

```bash
node start <URL>
```