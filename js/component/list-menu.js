module.exports = {
  props: ["state"],
  watch: {
    "state.settings"() {
      if(this.state.settings) {
        this.$emit("disable");
      }
      else {
        this.$emit("enable");
      }
    }
  },
  events: {
    disable() {
      this.beforeState = {
        newPost: this.state.newPosts,
        posts: this.state.posts,
        heading: this.state.heading
      };
      this.state.newPost = false;
      this.state.posts = false;
      this.state.heading = false;
    },
    enable() {
      this.state.newPosts = this.beforeState.newPost;
      this.state.posts = this.beforeState.posts;
      this.state.heading = this.beforeState.heading;
    }
  },
  template: `
    <ul class="m-menu" :class="{'state-settings': state.settings}">
      <li class="m-menu__item"
          @click="addNewPost"
          :class="{'m-menu__item--current': state.newPost}"
          :disabled="state.settings"
      >
        <a>
          <span class="m-menu__newPost"></span>
          <span>NEW POST</span>
        </a>
      </li>
      <li class="m-menu__item"
          @click="toggleMenu('category')"
          :class="{'m-menu__item--current': state.category}"
          >
          <a>
          <i class="fa fa-home"></i><span>HOME</span>
        </a>
      </li>
      <li class="m-menu__item state-posts"
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
