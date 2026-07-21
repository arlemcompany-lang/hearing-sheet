/**
 * 作業ヒアリングシート - フォーム送信処理
 *
 * デプロイ方法:
 * 1. Apps Scriptエディタでこのコードを貼り付け
 * 2. CONFIG.spreadsheetId に、回答を保存するスプレッドシートのIDを入力
 *    （スプレッドシートのURL中の /d/ と /edit の間の文字列）
 * 3. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」
 *    - 実行ユーザー：自分
 *    - アクセスできるユーザー：全員
 * 4. 発行された /exec URL を index.html の GAS_URL に貼り付け
 */

var CONFIG = {
  spreadsheetId: '1hktdMhfe7pu9lREHRVJxtstle2CcaGQ7M0awwFTPJg4',
  sheetName: '回答一覧',
  notifyEmail: 'hello@arlem-ai.com'
};

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  var sheet = ss.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);
    sheet.appendRow(['タイムスタンプ', 'お名前', '作業名', '作業順序', '使用ツール', '入力データの所在', '提出の仕方']);
  }

  var steps = (data.steps || []).map(function (s, i) {
    return (i + 1) + '. ' + s;
  }).join('\n');
  var tools = (data.tools || []).join('、');
  var sources = (data.sources || []).join('、');
  var submits = (data.submits || []).join('、');

  sheet.appendRow([
    new Date(),
    data.name || '',
    data.taskName || '',
    steps,
    tools,
    sources,
    submits
  ]);

  sendNotifyEmail(data, ss.getUrl());

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function sendNotifyEmail(data, sheetUrl) {
  var subject = '回答がありました。';
  var body =
    'ヒアリングシートに新しい回答がありました。\n\n' +
    'お名前：' + (data.name || '') + '\n' +
    '作業名：' + (data.taskName || '') + '\n\n' +
    'スプレッドシートはこちら：\n' + sheetUrl;

  MailApp.sendEmail(CONFIG.notifyEmail, subject, body);
}
