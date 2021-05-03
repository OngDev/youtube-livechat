import fetch from 'node-fetch';
import dotenv from 'dotenv';
import io from './index.js';
import { YouTubeLiveChat } from 'youtube-live-chat-ts';
dotenv.config();
const MESSAGES_API_URL = 'https://youtube.googleapis.com/youtube/v3/liveChat/messages';
const { YOUTUBE_CHANNEL_ID, API_KEY } = process.env;
const HELLO = "hello";
const QNA = "qna";
const NORMAL = "normal";

const handler = new YouTubeLiveChat(API_KEY);

let messages = [];
let authors = [];
let _pollingIntervalMillis, _nextPageToken;
let liveChatId = "";
let isFetchingMessages = false;



export async function initialize() {
    try {
        const currentLiveStreams = await handler.searchChannelForLiveVideoIds(YOUTUBE_CHANNEL_ID);
        const videoId = currentLiveStreams[0];
        const newLiveChatId = await handler.getLiveChatIdFromVideoId(videoId);

        console.log(`New livechatId: ${newLiveChatId}`)
        if (newLiveChatId && newLiveChatId !== "") {
            if (newLiveChatId !== liveChatId) {
                liveChatId = newLiveChatId;
                messages = [];
                await fetchMessages();
            } else if (!isFetchingMessages) {
                messages = [];
                await fetchMessages(_nextPageToken);
            }
            return true;
        }
        
    } catch (error) {
        console.error(error.message);
    }
    isFetchingMessages = false;
    return false;
}

export async function fetchMessages(pageToken = "") {
    if (!liveChatId) {
        console.log("Livechat Id is empty")
        return;
    }
    console.log({ pageToken });
    isFetchingMessages = true;
    let ENDPOINT =
        `${MESSAGES_API_URL}?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${API_KEY}&maxResults=200`;
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
    for (let index = 0; index < items.length; index++) {
        const { id, snippet, authorDetails } = items[index];
        const { publishedAt, displayMessage } = snippet;
        const { channelId, displayName, profileImageUrl, isChatOwner, isChatSponsor, isChatModerator } = authorDetails;

        const existedAuthor = authors.find(({ id }) => id === channelId);
        if (!existedAuthor) {
            const author = {
                id: channelId,
                name: displayName,
                avatarUrl: profileImageUrl,
                // role: "chauongdev"
                role: "👶"
            };

            if (isChatOwner) {
                author.role = "👑";
            }

            if (isChatModerator) {
                author.role = "🔧";
            }

            if (isChatSponsor) {
                author.role = "💎";
            }

            authors.push(author);
            io.emit("New author", author);
        }
        let messageType = NORMAL;
        if (displayMessage.includes("!" + HELLO)) {
            messageType = HELLO;
        } else if (displayMessage.includes("!" + QNA)) {
            messageType = QNA;
        }
        const message = {
            id,
            text: displayMessage,
            authorId: channelId,
            publishedAt,
            messageType
        };
        messages.push(message);
        io.emit("New message", message);
    }
    messages.sort((a, b) => +(new Date(a.publishedAt)) - +(new Date(b.publishedAt)));
}

export function getMessages(type) {
    switch (type) {
        case HELLO:
            return messages.filter(({ messageType }) => messageType === HELLO);
        case QNA:
            return messages.filter(({ messageType }) => messageType === QNA);
        case NORMAL:
            return messages.filter(({ messageType }) => messageType === NORMAL);
        default:
            return messages;
    }

}
export function getAuthors() {
    return authors;
}

export function archiveMessage(messageId) {
    messages = messages.filter(({ id }) => id !== messageId);
}
