import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const MESSAGES_API_URL = 'https://youtube.googleapis.com/youtube/v3/liveChat/messages';
const livechatId = 'KicKGFVDQTJ0RmsyTmR6T3pLcFNKZGYyNGNBZxILbVJiY2pBTUdrVnM';
const { API_KEY } = process.env;

const messages = {};

export async function fetchMessages(pageToken = "") {
    console.log({pageToken})
    let ENDPOINT = 
    `${MESSAGES_API_URL}?liveChatId=${livechatId}&part=snippet,authorDetails&key=${API_KEY}&maxResults=200`;
    if(pageToken) {
        ENDPOINT+=`&pageToken=${pageToken}`;
    }

    const response = await fetch(ENDPOINT);
    const result = await response.json();
    const {pollingIntervalMillis, nextPageToken, items} = result;

    if(items.length !== 0) {
        mapMessages(messages, items);
    }

    setTimeout( async () => {
        console.log({pageToken, pollingIntervalMillis})
        await fetchMessages(nextPageToken)
    }, pollingIntervalMillis);
}

const mapMessages = (messages, items) => {
    return items.forEach(({id,snippet,authorDetails}) => {
        const {publishedAt, displayMessage } = snippet;
        const {displayName, profileImageUrl } =authorDetails;
        messages[id] = {
            text: displayMessage,
            author: displayName,
            avatarUrl: profileImageUrl,
            publishedAt
        }
    })
}

export function getMessages() {
    return Object.entries(messages);
}