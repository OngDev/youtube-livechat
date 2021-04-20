const { createApp } = Vue;
const socket = io();

  const App = {
    data() {
      return {
        messages: [],
        authors: [],
      };
    },
    template: `
<<<<<<< HEAD
    <header>
    </header>
    <body>
    <div class="message-container" v-for="message in rederingMessages">
=======
    <div class="message-container" v-for="message in messages">
>>>>>>> master
      <div class="author-info"><img :src="message.avatarUrl"/> {{message.authorName}} {{message.authorRole}}</div>
      <p class="message-text"><b>{{message.text}}</b></p>
      <img src="./img/icon_archive.svg" alt="archive"/>
      <button></button>
    </div>
    </body>
      `,
    async mounted() {
//       author: "Tiến Nguyễn"
// avatarUrl: "https://yt3.ggpht.com/ytc/AAUvwnhPBnzVVk2vgEQ8ZcJaLe2Wf-rhe8pLAkkTSqwqWg=s88-c-k-c0x00ffffff-no-rj"
// id: "LCC.CikqJwoYVUNBMnRGazJOZHpPektwU0pkZjI0Y0FnEgtCc3kwV0RPTE5PZxI6ChpDSkx3OWViS2hmQUNGZUFOclFZZER6NEpVdxIcQ042MGhmTEFoZkFDRlU0QXR3QWRyWGdOLUExNQ"
// publishedAt: "2021-04-17T15:23:14.842695+00:00"
// text: "oke"
<<<<<<< HEAD

      await this.fetchMessages();
=======
>>>>>>> master
      await this.fetchAuthors();
      await this.fetchMessages();
      
      socket.on("New author", this.newAuthorEventHandler);
      socket.on("New message", this.newMessageEventHandler) ;
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
      }
    },
  };

  createApp(App).mount("#app");
