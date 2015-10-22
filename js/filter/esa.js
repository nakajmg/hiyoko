var _ = require("lodash");

module.exports = function esa(posts, input) {
  var words = input.split(" ");

  var filterdPosts = _.reduce(words, (ret, keyword , n) => {

    if (isSpecial(keyword)) {
      ret = searcher.specialChar(ret, keyword);
    }
    else if(keyword.indexOf(":") !== -1) {
      ret = searcher.keyValue(ret, keyword);
    }
    else {
      ret = searcher.all(ret, keyword);
    }

    return ret;
  }, posts);

  return filterdPosts;
};

var searcher = {
  all(posts, keyword) {
    return _.filter(posts, (post) => {
      return all(post, keyword);
    });
  },

  specialChar(posts, keyword) {
    return _.filter(posts, (post) => {
      return specialChar(post, keyword);
    });
  },

  keyValue(posts, keyword) {
    return _.filter(posts, (post) => {
      var type = keyword.split(":")[0];
      var value = keyword.split(":")[1];
      return keyValue(post, type, value);
    });
  }
};

function all(post, keyword, flip) {
  return _.some([body, name, tags, category], (fn) => {
    return fn(post, keyword, flip);
  });
}

function specialChar(post, keyword) {
  var initial = keyword.charAt(0);
  keyword = keyword.substr(1);
  switch(initial) {
    case "#":
      return tags(post, keyword);
    case "-":
      return all(post, keyword, true);
    case "@":
      return true
  }
  return false;
}

function keyValue(post, type, keyword) {
  var flip = false;
  if (isSpecial(keyword)) {
    if (keyword.charAt(0) === "-") {
      flip = true;
    }
    keyword = keyword.substr(1);
  }

  switch(type) {

    //  name:keyword or title:keyword
    //    記事名にkeywordを含むものを絞り込み
    case "name":
    case "title":
      return name(post, keyword, flip);

    //  wip:true or wip:false
    //    記事のwip状態で絞り込み
    case "wip":
      return wip(post, keyword, flip);

    //  category:keyword
    //    カテゴリ名にkeywordを含むものを絞り込み(部分一致)
    case "category":
      return category(post, keyword, flip);

    //  in:keyword
    //    カテゴリ名がkeywordから始まるものを絞り込み(前方一致)
    case "in":
      return inCategory(post, keyword, flip);

    //  body:keyword
    //    記事本文にkeywordを含むものを絞り込み
    case "body":
      return body(post, keyword, flip);

    //  #tag1 or tag:tag1
    //    tag1タグが付いているものを絞り込み
    case "tag":
      return tags(post, keyword, flip);

    /* 未実装
    //  user:screen_name or @screen_name
    //    記事作成者のscreen_nameで絞り込み

    //  comment:keyword
    //    コメント本文に keyword が含まれる記事を検索

    //  kind:stock or kind:flow
    //    記事の種類で絞り込み

    //  sharing:true or sharing:false
    //    記事の外部公開状態で絞り込み

    //  starred:true or starred:false
    //    自分がStarしている記事で絞り込み

    //  watched:true or watched:false
    //    自分がWatchしている記事で絞り込み

    //  stars:>3
    //    Star数が3より大きい記事を絞り込み

    //  watches:>4
    //    Watch数が4より大きい記事を絞り込み

    //  comments:>5
    //    コメント数が5より大きい記事を絞り込み

    //  created:>2015-07-05
    //    2015-07-05以降に作成された記事を絞り込み

    //  updated:>2015-07
    //    2015-07-01以降に更新された記事を絞り込み
    */

  }
}

function isSpecial(keyword) {
  var initial = keyword.charAt(0);
  return !!(initial === "#" || initial === "-" || initial === "@");
}

var matcher = {
  str(target, keyword, flip) {
    var ret = target && target.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    return flip ? !ret : ret;
  },
  arr(target, keyword, flip) {
    var ret = target && _.includes(target, keyword);
    return flip ? !ret : ret;
  },
  obj(target, keyword, filp) {
    return true;
  },
  bool(target, keyword, flip) {
    if (!_.isBoolean(keyword)) {
      keyword = (keyword === "true");
    }
    var ret = target === keyword;
    return flip ? !ret : ret;
  },
  reg: {
    start(target, keyword, flip) {
      var reg = `^${keyword}`;
      var ret = target && reg.test(target);
      return flip ? !ret : ret;
    }
  }
};

function body(post, keyword, flip) {
  return matcher.str(post.body_md, keyword, flip);
}

function tags(post, keyword, flip) {
  return matcher.arr(post.tags, keyword, flip);
}

function category(post, keyword, flip) {
  return matcher.str(post.category, keyword, flip);
}

function inCategory(post, keyword, flip) {
  return matcher.reg.start(post.category, keyword, flip);
}

function name(post, keyword, flip) {
  return matcher.str(post.name, keyword, flip);
}

function wip(post, keyword, flip) {
  return matcher.bool(post.wip, keyword, flip);
}
