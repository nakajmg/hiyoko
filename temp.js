var Qs = require("qs");
var team_name = "pxgrid";
var Promise = require("bluebird");
var fetch = require("isomorphic-fetch");
var token = require("./token");
var url = `https://api.esa.io/v1/teams/${team_name}`;
/*
document.querySelector("#fetch").addEventListener("click", () => {
  fetch(url + `/posts`, {
    credentials: 'include',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log(json);
//      db.post(json)
//        .then((res) => {
//          console.log(res.id);
//        });
    })
    .catch((err) => {
      console.log("fail")
    });
});
*/
