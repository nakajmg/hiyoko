module.exports = {
  data() {
    return {
      input: ""
    }
  },
  template: `
    <dialog>
      <button @click="cancel">キャンセル</button>
      <button @click="ok">OK</button>
    </dialog>
  `,

  events: {
    show() {
      this.$el.showModal();
    },
    close() {
      this.$el.close();
    },
    send(value) {
      this.$dispatch("closeDialogConfirm", value);
    }
  },

  methods: {
    cancel() {
      this.$emit("send", false);
      this.$emit("close")
    },
    ok() {
      this.$emit("send", true);
      this.$emit("close");
    }
  }
};
