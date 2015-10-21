module.exports = {
  data() {
    return {
      search: ""
    }
  },
  template: `
    <div class="m-headerMenu">
      <div class="m-searchBox">
        <i class="fa fa-search" id="search_icon"></i>
        <input type="text" v-model="search" placeholder="foo category:bar/baz comment:foobar">
      </div>
    </div>
  `
};
