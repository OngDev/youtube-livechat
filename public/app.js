const { createApp } = Vue;

  const App = {
    data() {
      return {
        name: "Gregg",
      };
    },
    template: `<h1>Hello {{ name }}</h1>`,
  };

  createApp(App).mount("#app");