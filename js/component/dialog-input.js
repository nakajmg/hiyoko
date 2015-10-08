module.exports = {
  data() {
    return {
      message: "",
      label: "",
      input: ""
    }
  },
  template: `
    <dialog class="dialog-input">
      <div class="dialog-input__heading">{{message}}</div><label>
        {{label}}<input v-model="input">
      </label>
      <div>
        <button class="m-dialogButton" @click="cancel"><i class="fa fa-times"></i>キャンセル</button>
        <button class="m-dialogButton" @click="send"><i class="fa fa-check"></i>OK</button>
      </div>
    </dialog>
  `,

  events: {
    show(options) {
      this.message = options.message;
      this.label = options.label;
      this.$el.showModal();
    },
    close() {
      this.$el.close();
    },
    reset() {
      this.message = "";
      this.input = "";
      this.label = "";
    },
    send(value) {
      this.$dispatch("close:dialog:input", value)
    }
  },

  methods: {
    send() {
      this.$emit("send", this.input);
      this.$emit("close");
    },
    cancel() {
      this.$emit("send", null);
      this.$emit("close");
    }
  },
  ready() {
    this.$el.addEventListener("cancel", () => {
      this.$emit("send", null);
    });
    this.$el.addEventListener("close", () => {
      this.$emit("reset");
    });
  }
};
