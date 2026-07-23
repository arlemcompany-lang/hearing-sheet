# CLAUDE.md — ヒヤリングシート

## プロジェクト概要
クライアント向けに作業効率化システム・自動化システムを制作する際、着手前にクライアントの業務内容・課題・要望を聞き取るためのヒアリングシート。
GitHub Pages上のWebフォームとして公開予定。

## 技術構成
- **フロントエンド**: ビルドシステムなし。純粋なHTML/CSS/JS（GitHub Pagesで公開予定）。
- **バックエンド**: GAS（Google Apps Script）をウェブアプリとしてデプロイし、`doPost` で受信。
  - 回答をスプレッドシートに1行追記
  - `hello@arlem-ai.com` へ「回答がありました。」という通知メールを送信（本文にスプレッドシートURLを記載）
- フロントはGAS_URLへ `fetch(..., {mode:'no-cors'})` でPOST送信するのみ（CORS制約回避のため送信結果はレスポンスで確認できない設計）。

## ページ構成（index.html）
- 企業名／担当者名／メールアドレス（任意）／作業名
- 作業順序（＋ボタンで手順を追加、×で削除、自動採番）
- 使用ツール（チェックボックス：エクセル、ワード、スプレッドシート、ドキュメント、その他）
- 入力データ元（チェックボックス：メール、書類、エクセル、ワード、スプレッドシート、ドキュメント、電話、メモ、その他）
- 提出の仕方（チェックボックス：メールにて文章、エクセル、ワード、スプレッドシート、ドキュメント、PDF、電話、その他）
- 「送信する」ボタン（GAS経由でスプレッドシート保存＋メール通知）
- 「回答内容をコピーする（控え用）」ボタン（クリップボードにコピーするだけ、送信はしない）
- 送信するまでの入力内容は`localStorage`に自動下書き保存。送信成功後は下書き削除＋自動リロードで真っさらな状態に戻る

## 状態
フロント（index.html）・GASコード（Code.gs）とも初版作成済み。以下が未設定のため、まだ動作しない。
- [x] Googleスプレッドシート「ヒヤリングシート回答一覧」を新規作成（hello@arlem-ai.com所有）し、`Code.gs` の `CONFIG.spreadsheetId` に設定済み
  - ID: `1hktdMhfe7pu9lREHRVJxtstle2CcaGQ7M0awwFTPJg4`
  - URL: https://docs.google.com/spreadsheets/d/1hktdMhfe7pu9lREHRVJxtstle2CcaGQ7M0awwFTPJg4/edit
- [x] Apps Scriptにコードを貼り付けてウェブアプリとしてデプロイ済み
- [x] 発行された `/exec` URLを `index.html` の `GAS_URL` に設定済み・動作確認済み（スプレッドシート追記＋メール通知とも正常）
- [x] GitHub Pagesへの公開（`arlemcompany-lang/hearing-sheet`、`https://arlemcompany-lang.github.io/hearing-sheet/`）

## ファイル構成
| ファイル | 役割 |
|---------|------|
| `index.html` | ヒアリングフォーム本体（GitHub Pages） |
| `Code.gs` | GAS側の処理（スプレッドシート追記＋メール通知）。clasp管理の原本 |
| `Code_貼り付け用.txt` | 旧・手動貼り付け運用の名残（clasp導入後は使わない。参考用に残置） |
| `ヒヤリングシート.md` | ヒアリング項目一覧（テキストテンプレート、参考用） |
| `.clasp.json` / `.claspignore` | clasp設定。scriptId: `1UNMDFR0D9TuJHrpI_AyebG2E4sUe2UyOhabc00tw1G5JvdOzWgWP1kV6`。push対象は`Code.gs`と`appsscript.json`のみ |

## GASのデプロイ方法（2026-07-23〜：clasp運用に変更）
`Code.gs` を編集したら、以下でリモートに反映する（`hello@arlem-ai.com` でclasp loginが必要）。
1. `clasp push` — スクリプト本体を更新
2. `clasp deploy -i AKfycbybKkh-CyAISbFOK4H-Nys2CvDkgiN8CQ8Iq3H4eYFnGoK7zuAcE8EKWAXinIP3SUqJ -d "変更内容"` — 既存デプロイ（index.htmlのGAS_URLと同じ）を新バージョンに更新。`-i`を付けないと別デプロイ（別URL）が作られてしまうので注意
- Apps Scriptエディタでの手動貼り付けはもう不要

## 開発時の注意
- 項目の追加・変更があれば `index.html` 内のチェックボックス群（`toolGroup`・`sourceGroup`・`submitGroup`）と、`Code.gs` のスプレッドシート列（ヘッダー行）を両方更新する
- スプレッドシートの列を増減する場合、実際のスプレッドシートのヘッダー行も手動で合わせる必要がある（`Code.gs`のappendRowはヘッダーを自動更新しない。既存シートがある限り新規作成時のヘッダー行コードは実行されないため）
