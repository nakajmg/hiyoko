module.exports = {
  props: ["posts", "state", "current"],
  computed: {
    isPosts() {
      return this.posts.length !== 0;
    }
  },
  template: `
    <ul class="m-postList" v-show="state" transition="m-postList">
      <li class="m-postList__item m-postList__item--current" v-if="!isPosts"><a>(\\( ⁰⊖⁰)/)  NO POST</a></li>
      <li class="m-postList__item"
        v-for="post in posts"
        :class="{'m-postList__item--current': $index === current}"
        @click="select($index)"
      >
        <a>{{post.name}}</a>
        <span class="m-postList__trash" @click="remove($index)"><i class="fa fa-trash"></i></span>
      </li>
    </ul>
  `,
  methods: {
    select($index) {
      this.$dispatch("change:posts:current", $index);
    },
    remove($index) {
      this.$dispatch("remove:posts", $index);
    }
  }
};
