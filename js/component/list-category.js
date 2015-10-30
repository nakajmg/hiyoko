var _ = require("lodash");
var Vue = require("vue");
var $ = jQuery = require("../../lib/jquery.min");
var postsFilter = require("../filter/esa");

Vue.component("p-child", {
  props:["children", "search", "posts"],
  template: `
    <ul>
      <li
        v-for="category in children"
        @click="select(category)"
        :hiyoko-depth="category.depth"
        :class="{'state-current': isCurrent(category)}"
        v-el:item
        track-by.literal="$key"
        >
        <a href="#" class="m-categoryList__name">{{$key}}
          <template v-if="hasChild(category)">
            <span @click="toggle" class="m-categoryList__tree"></span>
          </template>
          <span class="m-categoryList__count" v-text="count(category)"></span>
        </a>

        <p-child :children="category.children" :search="search" :posts="posts"></p-child>
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
    },
    count(category) {
      return _postCount(this.posts, this.getPath(category));
    }
  }
});

module.exports = {
  props: ["categories", "search", "state", "posts"],
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
          <a href="#" class="m-categoryList__name">
            <span class="m-categoryList__label">{{$key}}</span>
            <template v-if="hasChild(category)">
              <span @click="toggle" class="m-categoryList__tree"></span>
            </template>
            <span class="m-categoryList__count" v-text="count(category)"></span>
          </a>
          <p-child :search="search" :children="category.children" :posts="posts" v-if="hasChild(category)"></p-child>
        </li>
      </ul>
    </div>
  `,
  methods: {
    toggle() {
      event.stopPropagation();
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
    },
    count(category) {
      return _postCount(this.posts, this.getPath(category));
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

function _postCount(posts, keyword) {
  var posts = postsFilter(JSON.parse(JSON.stringify(posts)), `category:${keyword}`);
  return posts.length;
}
