# TournamentManagement
AWSを用いた大会運営Webアプリ

運営本部、審判、ユーザの3つそれぞれに作成した。以下はその使用例である（予めデータが何個か入っている）。
- 運営本部: https://prod.d3gaf27dvhhmj6.amplifyapp.com 
- 審判: https://prod.d3c09gotxzv4ny.amplifyapp.com
- ユーザ: https://prod.d1cy4rnmzcctck.amplifyapp.com

## 役割
林と渡辺の2人で作成した。林がAPI Gatewayの設定を含めたバックエンド側と、フロントエンド側の運営本部の作成を行なった。渡辺がフロントエンド側の審判とユーザの作成を行なった。

## 使用方法、フロントエンド側
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
   - 名前のセルが濃いオレンジで塗りつぶされている選手はコート確定控えor試合中、薄いオレンジで塗りつぶされている選手はコート未定控え、白色の選手は試合については何も予定がない選手である。新たに試合を追加する場合は、この表を参考にすると良い。
   - ページがリロードされた時点で、試合表にいる選手は自動で選手表に追加される。事前に表に選手を追加したい場合や代の変更を行いたい場合、表から余分や選手の削除は下のフォームから行うことができる。
  
![画面構成詳細3](https://github.com/reo001122/TournamentManagement/assets/65075435/17eebb5a-1613-48dc-91fc-0d9f02c2ff8d)

9. 各試合・控えカードをクリックすることで編集を行うことができる。
    - 編集前状態のとき（画像左側）、削除を押すとと削除される。6に表示されている進行中・控えの試合は試合終了を押すことで、終了済みの方へまわる。
    - 編集状態のとき（画像右側）、キャンセルを押すと保存されずに元の状態になり、保存を押すと更新される。7にあるものは、コート番号を入力した状態で保存することで、6に移動する。
  
上記で編集や追加などの情報の更新を行った後、自動でリロードされ、最新の状態を画面に表示する。

### 審判
画面の構成と機能について説明する。

### ユーザ
画面の構成について説明する。


## バックエンド

## 今後の展望
今回作成したアプリは、2024年1月はじめに開催された大会に間に合わせるために、最低限の機能のみを実装している。
今後、より使いやすくするために改良を実施する予定である。具体的には下記について行いたいと考えている。
- より精密なバリデーション処理
- 試合結果のpdfなどのデータ化をできるようにする
- 大会ごとに管理表を作れるようにする（現在は1つの大会のみ）
- 同一コート内で控えの順番を入れ替えられるようにする
- 審判用画面の機能の追加（ゲームだけだけでなくスコアのカウントも）


