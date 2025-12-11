import fetch from "node-fetch";
import * as cheerio from 'cheerio'

const seenURLs = {};

const getUrl = (link) => {
    if(link.includes('http')){
        return link;
    }else if(link.startsWith("/")){
        return `http://localhost:8080${link}`;
    }else{
        return `http://localhost:8080/${link}`;
    }
}

const crawl = async ({url}) => {
    if(seenURLs[url]) return;
    console.log('Crawling',url);
    seenURLs[url] = true;

    const response = await fetch(url)
    const html = await response.text();
    const $ = cheerio.load(html);
    const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();

    const images = $("img")
        .map((i, link) => link.attribs.src)
        .get();
    console.log("images", images);
    

    links.forEach(link => {
        crawl({
            url:getUrl(link),
        })
    })
}

crawl({
    url: "http://127.0.0.1:8080/index.html"
})