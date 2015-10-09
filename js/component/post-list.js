module.exports = {
  data() {
    return {
      posts: []
    }
  },
  template: `
    <ul class="m-postList">
      <li class="m-postList__item m-postList__item--current"><a>(\\( ⁰⊖⁰)/)  NO POST</a></li>
      <li class="m-postList__item" v-for="post in posts" :class="{'m-postList__item--current': $index === current}">
        <a>{{post.name}}</a>
        <span class="m-postList__trash"><i class="fa fa-trash"></i></span>
      </li>
    </ul>
  `
}
