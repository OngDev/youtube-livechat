import fetch from 'node-fetch';
import dotenv from 'dotenv';
import io from './index.js';
dotenv.config();
const MESSAGES_API_URL = 'https://youtube.googleapis.com/youtube/v3/liveChat/messages';
const livechatId = 'KicKGFVDQTJ0RmsyTmR6T3pLcFNKZGYyNGNBZxILQ3ZtOGVzYmdBeG8';
const { API_KEY } = process.env;

let messages = [];
let _pollingIntervalMillis, _nextPageToken;

export async function fetchMessages(pageToken = "") {
    console.log({ pageToken })
    let ENDPOINT =
        `${MESSAGES_API_URL}?liveChatId=${livechatId}&part=snippet,authorDetails&key=${API_KEY}&maxResults=200`;
    if (pageToken) {
        ENDPOINT += `&pageToken=${pageToken}`;
    }
    try {
        const response = await fetch(ENDPOINT);
        const result = await response.json();
        const { pollingIntervalMillis, nextPageToken, items } = result;

        _pollingIntervalMillis = pollingIntervalMillis;
        _nextPageToken = nextPageToken;
        if (items && items.length !== 0) {
            mapMessages(items);
        }

    } catch (error) {
        console.error(error.message || error.response?.data?.message);
    }


    setTimeout(async () => {
        console.log({ pageToken, _pollingIntervalMillis })
        await fetchMessages(_nextPageToken)
    }, _pollingIntervalMillis);
}

const mapMessages = (items) => {
    const newMessages = items.map(({ id, snippet, authorDetails }) => {
        const { publishedAt, displayMessage } = snippet;
        const { displayName, profileImageUrl } = authorDetails;
        return {
            id,
            text: displayMessage,
            author: displayName,
            avatarUrl: profileImageUrl,
            publishedAt
        }
    });
    messages.push(...newMessages);
    messages.sort((a,b) => +(new Date(a.publishedAt)) - +(new Date(b.publishedAt)));
    io.emit("New messages", newMessages);
}

export function getMessages() {
    console.log(messages.length);
    return messages;
}