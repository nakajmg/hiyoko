module.exports = {
  props: ["state"],
  event: {
    disable() {
      this.beforeState = {
        newPost: this.state.newPosts,
        posts: this.state.posts,
        settings: this.state.settings
      };
      this.state.newPost = false;
      this.state.posts = false;
      this.state.settings = false;
    },
    enable() {
      this.state.newPosts = this.beforeState.newPost || true;
      this.state.posts = this.beforeState.posts || true;
      this.state.settings = this.beforeState.settings || true;
    }
  },
  template: `
    <ul class="m-menu">
      <li class="m-menu__item"
          @click="addNewPost"
          :class="{'m-menu__item--current': state.newPost}"
      >
        <a>
          <span class="m-menu__newPost"></span>
          <span>NEW POST</span>
        </a>
      </li>
      <li class="m-menu__item"
          @click="toggleMenu('posts')"
          :class="{'m-menu__item--current': state.posts}"
      >
        <a>
          <i class="fa fa-file-text-o"></i><span>POSTS</span>
        </a>
      </li>
      <li class="m-menu__item --spacer"></li>
      <li class="m-menu__item"
          @click="toggleMenu('settings')"
          :class="{'m-menu__item--current': state.settings}"
      >
        <a>
          <i class="fa fa-gear"></i><span>SETTINGS</span>
        </a>
      </li>
    </ul>
  `,
  methods: {
    addNewPost() {
      this.$dispatch("add:newpost");
    },
    toggleMenu(type) {
      this.state[type] = !this.state[type];
    }
  }
};
