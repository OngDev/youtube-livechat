
const { createApp } = Vue;
const socket = io();

  const App = {
    data() {
      return {
        messages: [],
      };
    },
    template: `
    <div class="message-container" v-for="message in reversedMessages">
      <div class="author-info"><img :src="message.avatarUrl"/> {{message.author}}</div>
      <p class="message-text"><b>{{message.text}}</b></p>
    </div>`,
    async mounted() {
//       author: "Tiến Nguyễn"
// avatarUrl: "https://yt3.ggpht.com/ytc/AAUvwnhPBnzVVk2vgEQ8ZcJaLe2Wf-rhe8pLAkkTSqwqWg=s88-c-k-c0x00ffffff-no-rj"
// id: "LCC.CikqJwoYVUNBMnRGazJOZHpPektwU0pkZjI0Y0FnEgtCc3kwV0RPTE5PZxI6ChpDSkx3OWViS2hmQUNGZUFOclFZZER6NEpVdxIcQ042MGhmTEFoZkFDRlU0QXR3QWRyWGdOLUExNQ"
// publishedAt: "2021-04-17T15:23:14.842695+00:00"
// text: "oke"
      const res = await fetch('/messages');
      const messages = await res.json();
      this.messages = messages;
      socket.on("New messages", (newMessages) => {
        console.log(newMessages)
        this.messages.push(...newMessages);
      })
    },
    computed: {
      reversedMessages() {
        return this.messages.slice().reverse();
      }
    },
  };

  createApp(App).mount("#app");