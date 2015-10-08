module.exports = {
  data() {
    return {
      input: ""
    }
  },
  template: `
    <dialog>
      input:<input v-model="input">
      <button @click="send">send</button>
    </dialog>
  `,

  events: {
    show() {
      this.$el.showModal();
    },
    close() {
      this.$el.close();
    },
    reset() {
      this.input = "";
    },
    send(value) {
      this.$dispatch("closeDialogInput", value)
    }
  },

  methods: {
    send() {
      this.$emit("send", this.input);
      this.$emit("reset");
      this.$emit("close");
    }
  }
};
