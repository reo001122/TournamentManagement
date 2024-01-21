/** コンポーネントの設定 */
Vue.component('match-card', {
  props: ['match'],
  template:``
})

/** Vue アプリの生成 **/
function createApp() {
  new Vue({
    el: "#board",
    data: {
      filter: "inbox",
      matches: [],
      reserves: [],

      number: "",
      num_of_courts: get_NumOfCourts(),

      reloaded_time: new Date(),
      passed_time: 0,
      timer: "",
    },
    mounted(){
      axios.get('https://XXXXXXXXXX.amazonaws.com/dev/v1/tournament-data')
      .then(response => (initialize_matches(this.matches, this.reserves, JSON.parse(response.data.body))))
      .catch(function(error){ 
        alert('試合データの取得に失敗しました、、、' );
        console.log(error);
      });
      setInterval(this.updateTime, 1000); 
    },
    computed: {
      disabled_match: function() {
        return this.text0==="" || this.player1==="" || this.player2==="" || this.umpire===""
            || this.text3==="" || this.text3>this.num_of_courts || this.text3<0
      },
      disabled_reserve: function() {
        return this.text4==="" || this.player5==="" || this.player6===""
      },
      disabled_submit_number: function() {
        return this.number==="" || this.number<0 || this.number>20
      },
    },
    methods: {
      updateTime: function() {
        var now = new Date();
        var passed_time = parseInt((now.getTime() - this.reloaded_time.getTime()) / 1000);
        var hour = parseInt(passed_time / 3600);
	      var min = parseInt((passed_time / 60) % 60);
	      var sec = passed_time % 60;
        if(hour < 10) { hour = "0" + hour; }
	      if(min < 10) { min = "0" + min; }
	      if(sec < 10) { sec = "0" + sec; }
        var timer = hour + ':' + min + ':' + sec;
        this.timer = timer;
        this.passed_time = passed_time;
      },
      my_reload: function(){
        location.reload();
      },
      is_passed_threshold: function(edited_at){
        var now = new Date();
        var passed_updated_time = parseInt((now.getTime() - edited_at) / 1000);
        return passed_updated_time >= 360
      },
      formatDate: function(timestamp) {
        const date = new Date(timestamp)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()

        return year + "/" + month + "/" + day + " " + hour + ":" + minute
      },
      setFilter: function(filter) {
        this.filter = filter
      },
      filteredmatches: function(n) {
        const filter = this.filter
        return this.matches.filter(function(match) {
          return (filter === "completed" ? (match.done==-1) : (match.done>-1)) && (match.court_number == n)
        })
      },
      handleSubmit_num_of_courts: function() {
        localStorage.setItem('NumOfCourts', this.number);
        this.num_of_courts = this.number
        this.number = ""
      },
    }
  })
}

/** 初期化 **/
function initialize() {
  createApp()
}

/** 関数 **/
function initialize_matches(matches, reserves, body){
  for (let item of body["items_FC"]){
    matches.push({
      match_id: item.match_id,
      match_name: item.match_name,
      player1: item.player1,
      player2: item.player2,
      score1: item.score1,
      score2: item.score2,
      umpire: item.umpire,
      court_number: item.court_number,
      edited_at: item.edited_at,
      done: item.done,

      isEditing: false,
      match_name_sub: "",
      player1_sub: "",
      player2_sub: "",
      score1_sub: "",
      score2_sub: "",
      umpire_sub: "",
      court_number_sub: 0,
    })
  }
  new Promise((resolve)=>{
    matches.sort((a, b) =>
      a.edited_at > b.edited_at ? 1 : -1
    );
    resolve()
  })
  .then(()=>{
    matches.sort((a, b) =>
      a.done > b.done ? 1 : -1
    );
  })
  for (let item of body["items_UnFC"]){
    reserves.push({
      reserve_id: item.reserve_id,
      match_name: item.match_name,
      player1: item.player1,
      player2: item.player2,
      edited_at: item.edited_at,

      isEditing: false,
      match_name_sub: "",
      player1_sub: "",
      player2_sub: "",
      court_number_sub: 0,
    })
  }
  return
}

// 実行結果のアラートと、リロードの実行
function my_alert(result){
  if (!alert(JSON.parse(result).body)){
    location.reload()
  }
}

function get_NumOfCourts(){
  n = localStorage.getItem('NumOfCourts');
  if (n) {
    return n
  }
  else {
    return 4
  }
}

document.addEventListener("DOMContentLoaded", initialize.bind(this))
