module.exports = {
  props: ["post", "state"],
  computed: {
    isUrl() {
      return this.post && !!this.post.url;
    },
    isUpdate() {
      return true;
    },
    url() {
      return this.isUrl ? this.post.url : "";
    }
  },
  template: `
    <template v-if="state.editable">
      <label class="m-toolBtn">
        <input type="checkbox" v-model="state.editor"><i class="fa fa-pencil"></i>
      </label>
      <label class="m-toolBtn">
        <input type="checkbox" v-model="state.preview"><i class="fa fa-eye"></i>
      </label>
    </template>
    <span class="m-toolBtn" v-if="isUrl">
      <a :href="url"><i class="fa fa-external-link"></i></a>
    </span>
    <span class="m-toolBtn" v-if="isUpdate">
      <a><i class="fa fa-refresh"></i></a>
    </span>

    <div class="m-publishBtn">
      <button class="m-publishBtn__wip" :class="{'state-current': post.wip}">Save as WIP</button>
      <button class="m-publishBtn__ship" :class="{'state-current': !post.wip}">Ship It!</button>
    </div>
  `,

  methods: {
    openEditor(post) {
      this.$dispatch("open:editor", post);
    }
  }
};
