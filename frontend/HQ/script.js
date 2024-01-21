busy_color = {0:"#ffffff", 1:"#ffd0a2", 2:"#fe8d50"}

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
      player_list: [],

      text0: "", // 試合名
      player1: "", // 選手名1
      player2: "", // 選手名2
      text3: "", // コート番号
      umpire: "", // 審判名

      text4: "", // 試合名（控え）
      player5: "", // 選手名1（控え）
      player6: "", // 選手名2（控え）
      number: "",
      num_of_courts: get_NumOfCourts(),

      del_player: "",
      edit_player: "",
      edit_grade: "",

      reloaded_time: new Date(),
      passed_time: 0,
      timer: "",
    },
    mounted(){
      fetch('https://XXXXXXXXXX.amazonaws.com/dev/v1/players', {method: 'HEAD'})
      .then(response =>
        axios.get('https://XXXXXXXXXX.amazonaws.com/dev/v1/tournament-data')
        .then(response => (initialize_matches(this.matches, this.reserves, this.player_list, JSON.parse(response.data.body), this.num_of_courts)))
        .catch(function(error){ 
          alert('試合データの取得に失敗しました、、、' );
          console.log(error);
        })
      )
      .catch(function(error){ 
        alert('プレイヤーリストの更新に失敗しました、、、' );
        console.log(error);
      })
      setInterval(this.updateTime, 1000); 
    },
    computed: {
      disabled_match: function() {
        return this.text0==="" || this.player1==="" || this.player2==="" || this.umpire===""
            || this.text3==="" || this.text3>this.num_of_courts || this.text3<1
      },
      disabled_reserve: function() {
        return this.text4==="" || this.player5==="" || this.player6===""
      },
      disabled_submit_number: function() {
        return this.number==="" || this.number<0 || this.number>20
      },
      disabled_submit_player1: function() {
        return this.del_player===""
      },
      disabled_submit_player2: function() {
        return this.edit_player==="" || this.edit_grade===""
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
      is_passed_threshold: function(edited_at, done){
        var now = new Date();
        var passed_updated_time = parseInt((now.getTime() - edited_at) / 1000);
        return passed_updated_time >= 360 && done===0
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
        this.add_match(this.text0, this.player1, this.player2, this.text3, this.umpire)
      },
      handleSubmit_reserve: function() { // 試合追加: v1/reserve/POST1
        this.add_reserve(this.text4, this.player5, this.player6)
      },
      handleSubmit_num_of_courts: function() {
        localStorage.setItem('NumOfCourts', this.number);
        this.num_of_courts = this.number
        this.number = ""
      },
      handleSubmit_del_player: function() { // 試合追加: v1/players/DELETE
        this.del_this_player(this.del_player)
      },
      handleSubmit_edit_player: function() { // 試合追加: v1/players/PUT
        this.edit_this_player(this.edit_player, this.edit_grade)
      },
      add_match: function(text0, player1, player2, text3, umpire) { // 試合追加: v1/match/POST1.1
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          "player1": player1,
          "player2": player2,
          "umpire": umpire,
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
      add_reserve: function(text0, player1, player2) { // 試合追加: v1/reserve/POST1.1
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          "player1": player1,
          "player2": player2,
          "match_name": text0
        });
        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/reserve", requestOptions)
        .then(response => response.text())
        .then(result => my_alert(result))
        .catch(error => console.log('error', error));
      },
      del_this_player: function(player) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          "player_name": player.replace(/さん/g, "").replace(/[-+#、,.。/　 _~|・]/g,"")
        });
        var requestOptions = {
          method: 'DELETE',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/players", requestOptions)
        .then(response => response.text())
        .then(result => my_alert(result))
        .catch(error => console.log('error', error));
      },
      edit_this_player: function(player, grade) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
          "player_name": player.replace(/さん/g, "").replace(/[-+#、,.。/　 _~|・]/g,""),
          "grade": grade,
        });
        var requestOptions = {
          method: 'PUT',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/players", requestOptions)
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
      edit_reserve: function(reserve_id) { // 控え編集状態に
        this.reserves = this.reserves.map(function(reserve) {
          if (reserve.reserve_id === reserve_id) {
            reserve.isEditing = !reserve.isEditing
            reserve.match_name_sub = reserve.match_name
            reserve.player1_sub = reserve.player1
            reserve.player2_sub = reserve.player2
            reserve.court_number_sub = reserve.court_number
          }
          return reserve
        })
      },
      cancel_edit_reserve: function(reserve_id) { // 控え編集をキャンセル
        this.reserves = this.reserves.map(function(reserve) {
          if (reserve.reserve_id === reserve_id) {
            reserve.isEditing = !reserve.isEditing
          }
          return reserve
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
              if (match.court_number != match.court_number_sub) {raw_sub["court_number"] = match.court_number_sub;}
            }
          };
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
      save_reserve: function(reserve_id) { // 試合編集を保存: v1/reserve/PUT
        new Promise((resolve) => {
          for (const reserve of this.reserves) {
            if (reserve.reserve_id === reserve_id) {
              var court_number_sub = reserve.court_number_sub
            }
          }
          resolve(court_number_sub)
        })
        .then((court_number_sub) => {
          if (court_number_sub === undefined) { // コートへの移動ない場合
            if (window.confirm("変更を保存しますか？")) {
              var myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              var raw_sub = {
                "reserve_id": reserve_id,
              };
              for (const reserve of this.reserves) {
                if (reserve.reserve_id === reserve_id) {
                  if (reserve.match_name != reserve.match_name_sub) {raw_sub["match_name"] = reserve.match_name_sub;}
                  if (reserve.player1 != reserve.player1_sub) {raw_sub["player1"] = reserve.player1_sub;}
                  if (reserve.player2 != reserve.player2_sub) {raw_sub["player2"] = reserve.player2_sub;}
                }
              };
              var raw = JSON.stringify(raw_sub);
              var requestOptions = {
                method: 'PUT',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
              };
              fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/reserve", requestOptions)
              .then(response => response.text())
              .then(result => my_alert(result))
              .catch(error => console.log('error', error));
            }
          }
          else { // コートへの移動ある場合
            if (window.confirm(court_number_sub+"番コートに移動しますか?")){
              try{
                new Promise((resolve)=>{
                  // まずmatchesに追加する
                  var myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/json");
                  var raw_sub = {};
                  for (const reserve of this.reserves) {
                    if (reserve.reserve_id === reserve_id) {
                      raw_sub["player1"] = reserve.player1_sub;
                      raw_sub["player2"] = reserve.player2_sub;
                      raw_sub["umpire"] = "";
                      raw_sub["court_number"] = court_number_sub;
                      raw_sub["match_name"] = reserve.match_name_sub;
                    }
                  };
                  var raw = JSON.stringify(raw_sub);
                  var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                  };
                  fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/match", requestOptions)
                  resolve()
                })
                .then(()=>{
                  // 次にreservesから削除する
                  var myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/json");
                  var raw = JSON.stringify({
                    "reserve_id": reserve_id,
                  });
                  var requestOptions = {
                    method: 'DELETE',
                    headers: myHeaders,
                    body: raw,
                    redirect: 'follow'
                  };
                  fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/reserve", requestOptions)
                })
                .then(()=>{
                  if (!alert("更新しました")){
                    location.reload()
                  }
                })
              } catch (error){
                console.log('error', error)
              }
            }
            else{
              var textForm = document.getElementById("court-num-for-reserve");
              textForm.value = "";
            }
          }
        })
      },
      finish_match: function(match_id) { // 試合状態を終了へ: v1/match/PUT
        if (window.confirm("本当に試合終了にしますか？")){
          // 対象の試合終了
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          var raw = JSON.stringify({
            "match_id": match_id,
            "is_finish": 1,
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
          // 対象の試合の削除
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
        }
      },
      delete_reserve: function(reserve_id) { // 試合削除: v1/reserve/DELETE
        if (window.confirm("本当に削除しますか？")){
          // 対象の控えの削除
          var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");
          var raw = JSON.stringify({
            "reserve_id": reserve_id,
          });
          var requestOptions = {
            method: 'DELETE',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          fetch("https://XXXXXXXXXX.amazonaws.com/dev/v1/reserve", requestOptions)
          .then(response => response.text())
          .then(result => my_alert(result))
          .catch(error => console.log('error', error));
        }
      },
      disabled_save: function(match) {
        return match.match_name_sub==="" || match.player1_sub==="" || match.player2_sub==="" || match.court_number_sub===""
                || match.score1_sub==="" || match.score2_sub===""
                || match.court_number_sub>this.num_of_courts || match.court_number_sub<=0
      },
      disabled_reserve_save: function(reserve) {
        return reserve.match_name_sub==="" || reserve.player1_sub==="" || reserve.player2_sub==="" || reserve.court_number_sub===""
                || reserve.court_number_sub>this.num_of_courts || reserve.court_number_sub<=0
      },
    }
  })
}

/** 初期化 **/
function initialize() {
  createApp()
}

/** 関数 **/
function initialize_matches(matches, reserves, player_list, body, num_of_courts){
  var player_list_sub = {};
  var min_court=0;
  new Promise((resolve)=>{
    for (let item of body["items_Pl"]){
      player_list_sub[item["player_name"]] = {
        grade: item["grade"],
        main_match_n: 0,
        exhibition_match_n: 0,
        umpire_n: 0,
        is_busy: 0, // 0:待機, 1:コート未定, 2:コート確定
        is_where: ""
      }
    }
    resolve()
  })
  .then(()=>{
    for (let item of body["items_FC"]){
      // matchesへの追加
      this_match = {
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
      }
      if(min_court<Number(item.court_number)){min_court=Number(item.court_number)}
      matches.push(this_match)
      // player_listへの加算(処理により、すべてのプレーヤーがリストに入っている前提)
      add_to_player_list(this_match, player_list_sub)
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
      this_reserve = {
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
      }
      reserves.push(this_reserve)
      add_to_player_list(this_reserve, player_list_sub)
    }
  })
  .then(()=>{
    for (let player in player_list_sub){
      player_list_sub[player].total_n = player_list_sub[player].main_match_n + player_list_sub[player].exhibition_match_n;
      player_list.push({...{name: player}, ...player_list_sub[player]})
    }
    player_list.sort((a, b) =>
      a.grade > b.grade ? 1 : -1
    );
  })
  .then(()=>{
    if(num_of_courts<min_court){num_of_courts=min_court}
    make_players_table(player_list) 
  })
  return
}

// 実行結果のアラートと、リロードの実行
function my_alert(result){
  if (!alert(JSON.parse(result).body)){
    location.reload()
  }
}

// 表示コート数の保存
function get_NumOfCourts(){
  n = localStorage.getItem('NumOfCourts');
  if (n) {
    return Number(n)
  }
  else {
    return 10
  }
}

function add_to_player_list(item, player_list){
  // 試合の回数のカウント
  players_of_match = []
  players_of_match.push(...item.player1.replace(/さん/g, "").replace(/なし/g, "").replace(/未定/g, "").replace(/（/g, "(").replace(/）/g, ")").split(/[-+#、,.。/　 _~|・]/).filter(Boolean));
  players_of_match.push(...item.player2.replace(/さん/g, "").replace(/なし/g, "").replace(/未定/g, "").replace(/（/g, "(").replace(/）/g, ")").split(/[-+#、,.。/　 _~|・]/).filter(Boolean));
  if (item.match_name.includes("エキシビ") || item.match_name.includes("ex")) { // エキシビの回数
    for (let player of players_of_match) {
      player_list[player].exhibition_match_n++;
    }
  }
  else { // エキシビ以外の回数
    for (let player of players_of_match) {
      player_list[player].main_match_n++;
    }
  }
  umpires_of_match = []
  if ("umpire" in item) { // 審判の回数
    umpires_of_match.push(...item.umpire.replace(/さん/g, "").replace(/なし/g, "").replace(/未定/g, "").replace(/（/g, "(").replace(/）/g, ")").split(/[-+#、,.。/　 _~|・]/).filter(Boolean));
    for (let umpire of umpires_of_match) {
      player_list[umpire].umpire_n++;
    }
  }

  // 現在地の代入
  if ("done" in item){ // コート確定試合
    if (item.done==0){
      for (let player of players_of_match) { // 選手
        player_list[player].is_where += "試合中@No."+item.court_number+", ";
        player_list[player].is_busy = Math.max(player_list[player].is_busy, 2)
      }
      for (let umpire of umpires_of_match) { // 審判
        player_list[umpire].is_where += "審判@No."+item.court_number+", ";
      }
    }
    else if (item.done>0){ //コート確定控え
      for (let player of players_of_match) { // 選手
        player_list[player].is_where += "控え@No."+item.court_number+", ";
        player_list[player].is_busy = Math.max(player_list[player].is_busy, 2)
      }
      for (let umpire of umpires_of_match) { // 審判
        player_list[umpire].is_where += "審判控え@No."+item.court_number+", ";
      }
    }
  }
  else { // コート未定控え
    for (let player of players_of_match) { // 選手
      player_list[player].is_where += "コート未定控え, ";
      player_list[player].is_busy = Math.max(player_list[player].is_busy, 1)
    }
  }
}

// 選手の表を作成する関数
function make_players_table(player_list) {
  var table = document.createElement('table');
  var tr = document.createElement('tr');
  // ヘッダー
  var th1 = document.createElement('th');
  var th2 = document.createElement('th');
  var th3 = document.createElement('th');
  var th4 = document.createElement('th');
  var th5 = document.createElement('th');
  var th6 = document.createElement('th');
  var th7 = document.createElement('th');
  th1.textContent = "代";
  th2.textContent = "名前";
  th3.textContent = "本戦数";
  th4.textContent = "エキシビ数";
  th5.textContent = "合計";
  th6.textContent = "審判数";
  th7.textContent = "現在の状態";
  tr.appendChild(th1);
  tr.appendChild(th2);
  tr.appendChild(th3);
  tr.appendChild(th4);
  tr.appendChild(th5);
  tr.appendChild(th6);
  tr.appendChild(th7);
  table.appendChild(tr);

  for (let player of player_list) {
    // 行(プレイヤーごと)生成
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    var td4 = document.createElement('td');
    var td5 = document.createElement('td');
    var td6 = document.createElement('td');
    var td7 = document.createElement('td');
    td1.textContent = player.grade;
    td2.textContent = player.name+"さん";
    td3.textContent = player.main_match_n;
    td4.textContent = player.exhibition_match_n;
    td5.textContent = player.total_n;
    td6.textContent = player.umpire_n;
    td7.textContent = player.is_where.slice(0,-2);
    td2.style.background = busy_color[player.is_busy]
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tr.appendChild(td7);
    table.appendChild(tr);
    }

  document.getElementById('players-table').appendChild(table);
}

document.addEventListener("DOMContentLoaded", initialize.bind(this))
