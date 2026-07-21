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
  // 日本語（マルチバイト文字）の文字化けを防ぐため、クライアント側でBase64化して送信している
  var jsonStr = Utilities.newBlob(Utilities.base64Decode(e.postData.contents)).getDataAsString('UTF-8');
  var data = JSON.parse(jsonStr);

  var ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  var sheet = ss.getSheetByName(CONFIG.sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);
    sheet.appendRow(['タイムスタンプ', 'お名前', 'メールアドレス', '作業名', '作業順序', '使用ツール', '入力データの所在', '提出の仕方']);
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
    data.email || '',
    data.taskName || '',
    steps,
    tools,
    sources,
    submits
  ]);

  // 作業順序は手順ごとに改行しているため、セル内で折り返して全行見えるようにする
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 5).setWrap(true).setVerticalAlignment('top');

  sendNotifyEmail(data, ss.getUrl());

  if (data.email) {
    sendCopyEmail(data, steps, tools, sources, submits);
  }

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

function sendCopyEmail(data, steps, tools, sources, submits) {
  var subject = '【控え】作業ヒアリングシートのご回答ありがとうございました';
  var body =
    (data.name || '') + ' 様\n\n' +
    'ヒアリングシートへのご回答ありがとうございました。\n' +
    '以下、ご回答内容の控えです。\n\n' +
    'お名前：' + (data.name || '') + '\n' +
    '作業名：' + (data.taskName || '') + '\n\n' +
    '■ 作業順序\n' + (steps || '(未入力)') + '\n\n' +
    '■ 使用ツール：' + (tools || '(未選択)') + '\n' +
    '■ 入力データの所在：' + (sources || '(未選択)') + '\n' +
    '■ 提出の仕方：' + (submits || '(未選択)') + '\n';

  MailApp.sendEmail(data.email, subject, body);
}
