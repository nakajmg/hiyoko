var _ = require("lodash");
var Vue = require("vue");
var $ = jQuery = require("../../lib/jquery.min");
Vue.component("p-child", {
  props:["children", "search"],
  template: `
    <ul>
      <li
        v-for="child in children"
        @click="select(child)"
        :hiyoko-depth="child.depth"
        :class="{'state-current': isCurrent(child)}"
        v-el:item
        track-by.literal="$key"
        >
        <a class="m-categoryList__name">{{$key}}
          <template v-if="hasChild(child)">
            <span @click="toggle" class="m-categoryList__tree"></span>
          </template>
        </a>

        <p-child :children="child.children" :search="search"></p-child>
      </li>
    </ul>
  `,
  methods: {
    toggle() {
      event.stopPropagation();
      _toggle(event);
    },
    hasChild(category) {
      return _hasChild(category);
    },
    select(category) {
      event.stopPropagation();
      var path = _getPath(category);
      this.$dispatch("set:keyword", "category:" + path);
    },
    getPath(category) {
      return _getPath(category);
    },
    isCurrent(category) {
      return _isCurrent(category, this.search);
    }
  }
});

module.exports = {
  props: ["categories", "search", "state"],
  template: `
    <div class="m-categoryList" v-show="state.category" transition="m-categoryList">
      <ul class="m-categoryList__list" v-el:list>
        <li class="m-categoryList__item"
          v-for="category in categories"
          @click="select(category)"
          :hiyoko-depth="category.depth"
          :search="search"
          :class="{'state-current': isCurrent(category)}"
          v-ref:item
          >
          <a class="m-categoryList__name">{{$key}}
            <span @click="toggle" class="m-categoryList__tree"></span>
          </a>
          <p-child :search="search" :children="category.children" v-if="hasChild(category)"></p-child>
        </li>
      </ul>
    </div>
  `,
  methods: {
    toggle() {
      _toggle(event);
    },
    select(category) {
      event.stopPropagation();
      var path = _getPath(category);
      this.$dispatch("set:keyword", "category:" + path);
    },
    hasChild(category) {
      return _hasChild(category);
    },
    getPath(category) {
      return _getPath(category);
    },
    isCurrent(category) {
      return _isCurrent(category, this.search);
    }
  }
};

function _toggle(event) {
  var list = event.currentTarget.closest("li");
  list.classList.toggle("state-open");
}

function _hasChild(category) {
  return (_.keys(category.children).length !== 0);
}

function _getPath(category) {
  if (!category.path) {
    return category.origin.split("/").splice(0, category.depth + 1).join("/");
  }
  else {
    return category.path;
  }
}

function _isCurrent(category, search) {
  if (!search) return false;
  var path = _getPath(category);
  var cat = search.split(":");
  if (cat[1] && cat[1] === path) {
    return true;
  }
  else {
    return false;
  }
}
