module.exports = {
  data() {
    return {
      notifications: []
    }
  },

  template: `
    <dialog class="m-notify">
      <div class="m-notify__heading"></div>
      <div>
        <p transition="m-notify" class="m-notify__message" v-for="notify in notifications" :class="{'state-warning': notify.warning, 'state-error': notify.error, 'state-wip': notify.wip}" v-on:click="closeNotify($index)">
          <i class="fa"></i><span>{{notify.message}}</span>
        </p>
      </div>
    </dialog>
  `,

  events: {
    "add"(options) {
      this.notifications.push(options);

      if (options.autoClose !== false) {
        setTimeout(() => {
          this.notifications.splice(0, 1);
        }, 2000);
      }
    }
  },

  methods: {
    closeNotify($index) {
      this.notifications.splice($index, 1);
    }
  },

  ready() {
    this.$el.show();
  }
};
