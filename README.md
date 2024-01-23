# TournamentManagement
AWSを用いた大会運営Webアプリ

運営本部、審判、ユーザの3つそれぞれに作成した。以下はその使用例である（予めデータが何個か入っている）。
- 運営本部: https://prod.d3gaf27dvhhmj6.amplifyapp.com 
- 審判: https://prod.d3c09gotxzv4ny.amplifyapp.com
- ユーザ: https://prod.d1cy4rnmzcctck.amplifyapp.com

(上記について、実際に動かすことはできますが、極端な操作は行わないようにお願いします。)

以下にこのアプリに関する説明を行う
- 役割
- フロントエンド(使用方法)
- データベース
- バックエンド
- アプリとしての構成
- 今後の展望

## 役割
林と渡辺の2人で作成した。林がAPI Gatewayの設定を含めたバックエンド側と、フロントエンド側の運営本部の作成を行なった。渡辺がフロントエンド側の審判とユーザの作成を行なった。

## フロントエンド（使用方法）
フロントエンド側のコードを、AWS Amplifyにアップロードすることで、Webアプリ化した。

### 運営本部
画面の構成と機能について説明する。

![画面構成詳細](https://github.com/reo001122/TournamentManagement/assets/65075435/21469c03-5fc2-410f-b26f-54d3e13ba30d)
1. ここから表示するコート数を指定することができる。
2. このボタンからページ更新することができる。
   - 最後に更新してから1分以上経つと、「ページを更新しましょう！」と表示されるが、これは審判など他の端末から更新された内容は自動で更新されず手動で更新する必要があるためである（編集中に情報更新されることを防ぐため）。
3. ここのフォームから新規試合・控えを作成することができる。ただし、作成する試合・控えのコート番号を指定する必要がある。
4. ここのフォームから新規控えを作成することができる。ただし、作成する控えのコート番号は指定することはできない。

![画面構成詳細2](https://github.com/reo001122/TournamentManagement/assets/65075435/61ba8e07-ec5e-49a7-a7be-d49dc94e0db4)

5. このタブから表示させる試合を、進行中・控えか終了済みかで切り替えることができる。
6. ここには進行中・控えの（5で終了済みタブを選択している場合は終了済みの）試合が表示される。
   - 各コート上段が進行中の試合であり、それに続くものが控えの試合である。また、進行中の試合のうち、最後の更新（各試合カード右上の値）から6分以上経過しているものは、オレンジで表示されるため、情報の新鮮度がわかる。
7. ここにはコートがまだ指定されていない控えが表示される。
8. この選手表は、各選手が試合・審判に入った回数と、現在の状態（試合中、控え、審判など）が表示される。
   - dynamoDBから取得したデータを元に、フロントエンド側で計算を行なって表示している。
   - 名前のセルが濃いオレンジで塗りつぶされている選手はコート確定控えor試合中、薄いオレンジで塗りつぶされている選手はコート未定控え、白色の選手は試合については何も予定がない選手である。新たに試合を追加する場合は、この表を参考にすると良い。
   - ページがリロードされた時点で、試合表にいる選手は自動で選手表に追加される。事前に表に選手を追加したい場合や代の変更を行いたい場合、表から余分や選手の削除は下のフォームから行うことができる。
  
![画面構成詳細3](https://github.com/reo001122/TournamentManagement/assets/65075435/17eebb5a-1613-48dc-91fc-0d9f02c2ff8d)

9. 各試合・控えカードをクリックすることで編集を行うことができる。
    - 編集前状態のとき（画像左側）、削除を押すとと削除される。6に表示されている進行中・控えの試合は試合終了を押すことで、終了済みの方へまわる。
    - 編集状態のとき（画像右側）、キャンセルを押すと保存されずに元の状態になり、保存を押すと更新される。7にあるものは、コート番号を入力した状態で保存することで、6に移動する。
  
上記で編集や追加などの情報の更新を行った後、自動でリロードされ、最新の状態を画面に表示する。

### 審判
画面の構成と機能について説明する。

![画面構成詳細4](https://github.com/reo001122/TournamentManagement/assets/65075435/25c5172d-af96-4d5d-a297-4aaf3b65863a)

10. ここにストップウォッチがあり、各ボタンから操作することができる。
    - 各ポイント間やインジュアリー、ウォームアップなどでの必要な時間の計測に使うと良い。
11. ここから試合情報の編集を行うことができる。操作方法は本部用画面と同様である。

### ユーザ
画面の構成について説明する。
スマホで見たときには次のような画面になる。また、1分おきに自動でリロードが行われる。

<img width="381" alt="スクリーンショット 2024-01-22 0 17 22" src="https://github.com/reo001122/TournamentManagement/assets/65075435/a0492acf-d8fe-439e-8f77-de1d92f005e0">

## データベース
ここでは3つのAWS dynamoDBを用いている。

### TournamentManagement-FixedCourt (table-FC)
コート番号が確定している試合についてのデータベースである。データベースの項目は下記である。

|match_id|court_number|done|edited_at|match_name|player1|player2|score1|score2|umpire|
|---|---|---|---|---|---|---|---|---|---|
|この試合のID（プライマリキー）|コート番号|試合済・試合中・控え|最終編集時刻|試合名|選手1|選手2|選手1のスコア|選手2のスコア|審判|

### TournamentManagement-UnFixedCourt (table-UnFC)
コート番号が未定の試合についてのデータベースである。データベースの項目は下記である。

|reserve_id|edited_at|match_name|player1|player2|
|---|---|---|---|---|
|この控えのID（プライマリキー）|最終編集時刻|試合名|選手1|選手2|

### TournamentManagement-Players (table-Pl)
選手についてのデータベースである。データベースの項目は下記である。
|player_name|grade|
|---|---|
|選手名（プライマリキー）|代|

## バックエンド
フロントエンド側からはAPI Gatewayを通じてlambda関数が実行され、dynamoDBに対して操作が行われる。
API リソースは次のようになっている。

<table>
<thead>
<tr>
<th scope="col">リソース</th>
<th scope="col">メソッド</th>
<th scope="col">lambda関数</th>
<th scope="col">説明</th>
</tr>
</thead>
   
<tbody align="left">
<tr>
   <th scope="col" rowspan="3">/match</th>
   <th scope="col">DELETE</th>
   <th scope="col">TournamentManagement_DeleteMatch</th>
   <th scope="col">table-FCから試合を削除する関数</th>
</tr>
<tr>
   <th scope="col">POST</th>
   <th scope="col">TournamentManagement_MakeMatch</th>
   <th scope="col">table-FCに試合を追加する関数</th>
</tr>
<tr>
   <th scope="col">PUT</th>
   <th scope="col">TournamentManagement_UpdateMatch</th>
   <th scope="col">table-FCの試合を更新する関数</th>
</tr>
</body>

<tbody align="left">   
<tr>
   <th scope="col" rowspan="3">/reserve</th>
   <th scope="col">DELETE</th>
   <th scope="col">TournamentManagement_DeleteReserve</th>
   <th scope="col">table-UnFCから試合を削除する関数</th>
</tr>
<tr>
   <th scope="col">POST</th>
   <th scope="col">TournamentManagement_MakeReserve</th>
   <th scope="col">table-UnFCに試合を追加する関数</th>
</tr>
<tr>
   <th scope="col">PUT</th>
   <th scope="col">TournamentManagement_UpdateReserve</th>
   <th scope="col">table-UnFCの試合を更新する関数</th>
</tr>
</tbody>

<tbody align="left">
<tr>
   <th scope="col" rowspan="4">/players</th>
   <th scope="col">DELETE</th>
   <th scope="col">TournamentManagement_DeletePlayer</th>
   <th scope="col">table-Plから選手を削除する関数</th>
</tr>
<tr>
   <th scope="col">POST</th>
   <th scope="col">TournamentManagement_MakePlayer</th>
   <th scope="col">table-Plに選手を追加する関数</th>
</tr>
<tr>
   <th scope="col">PUT</th>
   <th scope="col">TournamentManagement_UpdatePlayer</th>
   <th scope="col">table-Plの選手を更新する関数</th>
</tr>
<tr>
   <th scope="col">HEAD</th>
   <th scope="col">TournamentManagement_ScanPlayer</th>
   <th scope="col">table-FC, table-UnFCから選手をtable-Plに追加する関数</th>
</tr>
</tbody>

<tbody align="left">
<tr>
   <th scope="col" rowspan="1">/tournament-data</th>
   <th scope="col">GET</th>
   <th scope="col">TournamentManagement_scan</th>
   <th scope="col">3つのテーブルから情報を得る関数</th>
</tr>
</tbody>
</table>

## アプリとしての構成
参考までにアプリとしての構成は次のようになっている。

![構成](https://github.com/reo001122/TournamentManagement/assets/65075435/3e522866-a902-4b06-9fd9-f4bf711243eb)

## 今後の展望
今回作成したアプリは、2024年1月はじめに開催された大会に間に合わせるために、最低限の機能のみを実装している。
今後、より使いやすくするために改良を実施する予定である。具体的には下記について行いたいと考えている。
- より精密なバリデーション処理
- 表示コート数がデフォルトで10なので、審判用・ユーザ用画面は試合に応じて自動調整されるようにする。
- 試合結果のpdfなどのデータ化をできるようにする
- 大会ごとに管理表を作れるようにする（現在は1つの大会のみ）
- 同一コート内で控えの順番を入れ替えられるようにする
- 審判用画面の機能の追加（ゲームだけだけでなくスコアのカウントも）

## 参考文献
- 西畑一馬, 須郷晋也, 岡島美咲, 扇克至, 岩本大樹. 初心者からちゃんとしたプロになる Javascript基礎入門. MdN Corporation, 2020.
- Amazon Web Services. "AWSで基本的なWebアプリケーションを構築する". Amazon Web Services. 2024/1/5. [https://aws.amazon.com/jp/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/](https://aws.amazon.com/jp/getting-started/hands-on/build-web-app-s3-lambda-api-gateway-dynamodb/), (参照 2024/1/20).

