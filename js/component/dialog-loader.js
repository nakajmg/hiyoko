module.exports = {
  data() {

  },

  template: `
    <dialog class="m-loader">
      <i class="fa fa-spin fa-spinner"></i>
    </dialog>
  `,

  events: {
    show() {
      this.$el.showModal();
    },
    close() {
      this.$el.close();
    }
  }
};
