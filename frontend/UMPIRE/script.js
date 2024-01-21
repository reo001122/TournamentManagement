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
      text0: "", // 試合名
      player1: "", // 選手名1
      player2: "", // 選手名2
      text3: "", // コート番号
      number: "",
      num_of_courts: get_NumOfCourts(), //ここで制御されている
      num_of_deleted: 0,

      stopwatchTime: 0,
      stopwatchInterval: null,
    },
    mounted(){
      axios.get('https://XXXXXXXXXX.amazonaws.com/dev/v1/tournament-data')
      .then(response => (initialize_matches(this.matches, JSON.parse(response.data.body))))
      .catch(function(error){ 
        alert('試合データの取得に失敗しました、、、' );
        console.log(error);
      });
    },
    computed: {
      matchesLength: function() {
        return this.matches.length
      },
      disabled_match: function() {
        return this.text0==="" || this.player1==="" || this.player2==="" || this.text3==="" 
                || this.text3>this.num_of_courts || this.text3<0
      },
      disabled_submit_number: function() {
        return this.number==="" || this.number<0 || this.number>20
      },
    },
    methods: {
      startStopwatch() {
        if (this.stopwatchInterval) return;
        this.stopwatchInterval = setInterval(() => {
          this.stopwatchTime++;
          this.updateStopwatchDisplay();
        }, 1000);
      },
      stopStopwatch() {
        clearInterval(this.stopwatchInterval);
        this.stopwatchInterval = null;
      },
      resetStopwatch() {
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
      },
      updateStopwatchDisplay() {
        const hours = Math.floor(this.stopwatchTime / 3600);
        const minutes = Math.floor((this.stopwatchTime % 3600) / 60);
        const seconds = this.stopwatchTime % 60;
        document.getElementById('stopwatch-time').textContent = 
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
      handleSubmit_match: function() { // 試合追加: v1/match/POST1
        this.add_match(this.text0, this.player1, this.player2, this.text3)
      },
      handleSubmit_num_of_courts: function() {
        this.num_of_courts = this.number
        this.number = ""
      },
      add_match: function(text0, player1, player2, text3) { // 試合追加: v1/match/POST1.1
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          "player1": player1,
          "player2": player2,
          "court_number": text3,
          "match_name": text0
        });
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/match", requestOptions)
        .then(response => response.text())
        .then(result => my_alert(result))
        .catch(error => console.log('error', error));
      },
      edit_match: function(match_id) { // 試合編集状態に
        this.matches = this.matches.map(function(match) {
          if (match.match_id === match_id) {
            match.isEditing = !match.isEditing
            match.match_name_sub = match.match_name
            match.player1_sub = match.player1
            match.player2_sub = match.player2
            match.umpire_sub = match.umpire
            match.score1_sub = match.score1
            match.score2_sub = match.score2
            match.court_number_sub = match.court_number
          }
          return match
        })
      },
      cancel_edit_match: function(match_id) { // 試合編集をキャンセル
        this.matches = this.matches.map(function(match) {
          if (match.match_id === match_id) {
            match.isEditing = !match.isEditing
          }
          return match
        })
      },
      save_match: function(match_id) { // 試合編集を保存: v1/match/PUT
        if (window.confirm("変更を保存しますか？")) {
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          var raw_sub = {
            "match_id": match_id,
            "is_finish": 0,
          };
          for (const match of this.matches) {
            if (match.match_id === match_id) {
              if (match.match_name != match.match_name_sub) {raw_sub["match_name"] = match.match_name_sub;}
              if (match.player1 != match.player1_sub) {raw_sub["player1"] = match.player1_sub;}
              if (match.player2 != match.player2_sub) {raw_sub["player2"] = match.player2_sub;}
              if (match.umpire != match.umpire_sub) {raw_sub["umpire"] = match.umpire_sub;}
              if (match.score1 != match.score1_sub) {raw_sub["score1"] = match.score1_sub;}
              if (match.score2 != match.score2_sub) {raw_sub["score2"] = match.score2_sub;}
              if (match.court_number != match.court_number_sub) {raw_sub["court_number"] = match.court_number;}
            }
          }
          var raw = JSON.stringify(raw_sub);
          var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/match", requestOptions)
          .then(response => response.text())
          .then(result => my_alert(result))
          .catch(error => console.log('error', error));
        }
      },
      finish_match: function(match_id) { // 試合状態を終了へ: v1/match/PUT
        if (window.confirm("本当に試合終了にしますか？")){
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          var raw = JSON.stringify({
            "match_id": match_id,
            "done": -1,
          });
          var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/match", requestOptions)
          .then(response => response.text())
          .then(result => my_alert(result))
          .catch(error => console.log('error', error));
        }
      },
      delete_match: function(match_id) { // 試合削除: v1/match/DELETE
        if (window.confirm("本当に削除しますか？")){
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          var raw = JSON.stringify({
            "match_id": match_id,
          });
          var requestOptions = {
            method: 'DELETE',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/match", requestOptions)
          .then(response => response.text())
          .then(result => my_alert(result))
          .catch(error => console.log('error', error));
          this.num_of_deleted++
        }
      },
      disabled_save: function(match) {
        return match.match_name_sub==="" || match.player1_sub==="" || match.player2_sub==="" || match.court_number_sub===""
                || match.score1_sub==="" || match.score2_sub===""
                || match.court_number_sub>this.num_of_courts || match.court_number_sub<0
      },
    }
  })
}

/** 初期化 **/
function initialize() {
  createApp()
}

/** 関数 **/
function initialize_matches(matches, body){
  new_UnFC = [];
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
    new_UnFC.push({
      reserve_id: item.reserve_id,
      match_name: item.match_name,
      player1: item.player1,
      player2: item.player2,
      edited_at: item.edited_at,
    })
  }
  return
}

function get_NumOfCourts(){
  n = localStorage.getItem('NumOfCourts');
  if (n) {
    return Number(n)
  }
  else {
    return 10
  }
}

// 実行結果のアラートと、リロードの実行
function my_alert(result){
  if (!alert(JSON.parse(result).body)){
    location.reload()
  }
}



document.addEventListener("DOMContentLoaded", initialize.bind(this))
document.getElementById('stopwatch-time')