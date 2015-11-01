(function() {
  var $ = jQuery = require("./lib/jquery.min");
  $(function() {
    $(document).on("click", ".l-main a[href]", function(e) {
      e.originalEvent.preventDefault();
      var href = $(this).attr("href");
      require("shell").openExternal(href);
    });
  });
})();
