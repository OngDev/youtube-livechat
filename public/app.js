const { createApp } = Vue;
const socket = io();

  const App = {
    data() {
      return {
        messages: [],
        authors: [],
        error: "",
      };
    },
    async mounted() {
      const isInitialized = await this.initialize();
      if(!isInitialized) {
        this.error = "Failed to initialize livechat manager";
      }else {
        await this.fetchAuthors();
        await this.fetchMessages();

        socket.on("New author", this.newAuthorEventHandler);
        socket.on("New message", this.newMessageEventHandler) ;
      }
    },
    methods: {
      async fetchMessages() {
        const messageRes = await fetch('/messages');
        const messages = await messageRes.json();
        this.messages = this.mapMessages(messages.reverse());
      },
      async fetchAuthors() {
        const authorRes = await fetch('/authors');
      const authors = await authorRes.json();
      this.authors = authors;
      },
      newAuthorEventHandler(author) {
        this.authors.push(author);
        this.$forceUpdate();
      },
      newMessageEventHandler(newMessage) {
        const author = this.authors.find(({id}) => id === newMessage.authorId);
        const parsedMessage = {
          ...newMessage,
          avatarUrl: author.avatarUrl,
            authorName: author.name,
            authorRole: author.role,
        }
        this.messages.unshift(parsedMessage);
        this.$forceUpdate();
      },
      mapMessages(messages) {
        const authors = [...this.authors];
        return messages.map((message) => {
          const author = authors.find(({id}) => id === message.authorId);
          return {
            ...message,
            avatarUrl: author.avatarUrl,
            authorName: author.name,
            authorRole: author.role,
          }
        })
      },
      async archiveMessage(messageId) {
        const res = await fetch(`/messages/${messageId}/archive`);
        if(res.ok) {
          this.messages = this.messages.filter(({id}) => id !== messageId);
        }
      },
      async initialize() {
        const res = await fetch('/init');
        return res.ok;
      }
    },
  };

  createApp(App).mount("#app");
