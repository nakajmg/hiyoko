module.exports = {
  data() {
    return {
      message: ""
    }
  },
  template: `
    <dialog class="dialog-confirm">
      <div class="dialog-confirm__heading">{{message}}</div>
      <div>
        <button class="m-dialogButton" @click="cancel"><i class="fa fa-times"></i>キャンセル</button>
        <button class="m-dialogButton" @click="ok"><i class="fa fa-check"></i>OK</button>
      </div>
    </dialog>
  `,

  events: {
    show(options) {
      this.message = options.message;
      this.$el.showModal();
    },
    close() {
      this.$el.close();
    },
    send(value) {
      this.$dispatch("close:dialog:confirm", value);
    },
    reset() {
      this.message = "";
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
  },
  ready() {
    this.$el.addEventListener("cancel", () => {
      this.$emit("send", false);
    });
    this.$el.addEventListener("close", () => {
      this.$emit("reset");
    });
  }
};
