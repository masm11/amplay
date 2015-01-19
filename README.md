# All Music Player

Firefox OS Fx0 において、audio file をファイル名順に再生するアプリです。

## 注意

manifest.webapp において、type: certified と宣言してあります。
bluetooth headset 対応のためです。

## インストール方法

まず、amplay をダウンロードします。

````bash
git clone https://github.com/masm11/amplay.git
````

Firefox を起動し、メニューから Developer→WebIDE と選択すると
Firefox WebIDE のウィンドウが開きます。
Open App から Open Packaged App... を選択し、amplay を選択してください。

Fx0 と PC を USB で接続し、WebIDE の Select Runtime から LGL25 を選択し、
Fx0 で OK をタップ。その後、再生ボタン的アイコンを押すとインストールされます。

完了したら USB を抜いてください。

## 使い方

インストール時にアプリが起動してしまってると思いますが、ストレージのファイルが
見えてないと思いますので、一旦終了させた方が良いでしょう。
その後、ホーム画面で amplay アイコンをタップして起動してください。

scanning... 画面がしばらく続いた後、
画面中央に曲名とアーティスト名、画面下部にコントロールが表示されます。
コントロールでシーク、前の曲、再生、一時停止、次の曲、曲選択ができます。
アプリを起動してから曲選択ができるようになるまで、しばらく時間がかかります。
回ってるロゴには意味はありませんので気にしないでください。

scanning... にかかる時間や、曲選択画面の作成にかかる時間は
きっと曲数に応じて長くなると思います。

## ライセンス

Apache License とします。

## 作者

Yuuki Harano <masm@masm11.ddo.jp>
