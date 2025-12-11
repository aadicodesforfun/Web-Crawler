import fetch from "node-fetch";
import * as cheerio from 'cheerio';
import * as fsPromises from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";

const seenURLs = {};
const START_URL = process.argv[2];

const resolveUrl = (link, baseUrl) => {
    if (!link) return link;
    
    try {
        return new URL(link, baseUrl).href;
    } catch (e) {
        console.warn(`Invalid URL encountered: ${link} with base ${baseUrl}`);
        return null;
    }
}

const crawl = async ({ url }) => {
    if (!url || seenURLs[url]) return;

    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (e) {
        console.error(`Skipping invalid start URL: ${url}`);
        return;
    }

    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    
    try {
        await fsPromises.mkdir('images', { recursive: true });
    } catch (err) {
        console.error('Failed to create images directory: ', err.message);
        return;
    }

    console.log('Crawling', url);
    seenURLs[url] = true;

    let response;
    try {
        response = await fetch(url);
    } catch (err) {
        console.error(`Failed to fetch ${url}: `, err.message);
        return;
    }
    
    if (!response.ok) {
        console.error(`Request failed with status ${response.status} for ${url}`);
        return;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const rawLinks = $("a").map((i, link) => link.attribs.href).get();
    const rawImageURLs = $("img").map((i, link) => link.attribs.src).get();

    const imageDownloadPromises = rawImageURLs.map(async (imageURL) => {
        const fullImageUrl = resolveUrl(imageURL, baseUrl);
        if (!fullImageUrl) return;

        try {
            const imgResponse = await fetch(fullImageUrl);
            if (!imgResponse.ok) {
                console.error(`Image fetch failed for ${fullImageUrl}: ${imgResponse.status}`);
                return;
            }

            const urlObject = new URL(fullImageUrl);
            const filename = path.basename(urlObject.pathname);
            const destPath = path.join('images', filename);
            
            const dest = fs.createWriteStream(destPath); 

            await new Promise((resolve, reject) => {
                imgResponse.body.pipe(dest);
                dest.on('finish', resolve);
                dest.on('error', reject);
            });
            console.log(`Saved image: ${filename}`);
            
        } catch (err) {
            console.error(`Error saving image ${fullImageUrl}:`, err.message);
        }
    });

    await Promise.all(imageDownloadPromises);

    const targetHostname = parsedUrl.hostname;

    const crawlPromises = rawLinks
        .map(link => resolveUrl(link, baseUrl))
        .filter(fullLink => {
            if (!fullLink) return false;
            try {
                return new URL(fullLink).hostname.includes(targetHostname);
            } catch {
                return false;
            }
        })
        .map(fullLink => {
            return crawl({ url: fullLink });
        });

    await Promise.all(crawlPromises);
}

crawl({
    url: START_URL
});