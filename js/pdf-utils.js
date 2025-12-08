/**
 * PDF生成ユーティリティ
 * A4両面のブックカバーPDFを生成する
 */

// jsPDFのインポート（Node.js環境ではrequire、ブラウザではグローバル）
let jsPDF;
if (typeof window === 'undefined' || typeof window.jspdf === 'undefined') {
  // Node.js環境（テスト用）
  try {
    jsPDF = require('jspdf').jsPDF;
  } catch (e) {
    // モックを提供（テスト用）
    jsPDF = class MockJsPDF {
      constructor() {
        this.pages = 1;
      }
      setFillColor() {}
      setDrawColor() {}
      setLineDash() {}
      setFontSize() {}
      rect() {}
      line() {}
      text() {}
      addPage() { this.pages++; }
      output(type) {
        return new Blob(['mock pdf'], { type: 'application/pdf' });
      }
    };
  }
} else {
  // ブラウザ環境
  jsPDF = window.jspdf.jsPDF;
}

// 文庫本用寸法（mm）
const BOOK_DIMENSIONS = {
  width: 105,          // 本の幅
  height: 148,         // 本の高さ
  spine: 12,           // 背幅
  foldMargin: 45,      // 左右折り返し
  topBottomMargin: 3   // 上下余白
};

/**
 * ブックカバーPDFを生成する
 * @param {Object} options - オプション
 * @param {string} options.pattern - パターン名
 * @param {string} options.color - RGB色 (例: '#ff5500')
 * @param {ImageData} [options.userImage] - ユーザー画像
 * @param {Object} [options.imagePosition] - 画像位置 { x, y }
 * @param {number} [options.imageScale] - 画像スケール
 * @returns {Promise<Blob>} PDF Blob
 */
async function generateBookCoverPDF(options) {
  const { pattern, color, userImage, imagePosition, imageScale } = options;

  // A4横向きのPDFを作成（297mm × 210mm）
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // ページ1: 柄パターン
  await drawPage1(doc, pattern, color, userImage, imagePosition, imageScale);

  // ページ2: ガイド線
  doc.addPage();
  drawPage2(doc, pattern, color);

  // PDFをBlobとして返す
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

/**
 * ページ1を描画（柄パターン + ユーザー画像）
 */
async function drawPage1(doc, pattern, color, userImage, imagePosition, imageScale) {
  // A4横向き: 297mm × 210mm
  // ブックカバー全体幅: 312mm → 297mmに縮小（横方向のみ）
  const SCALE_X = 297 / 312;  // 横方向の縮小率: 0.9519
  const coverWidth = 297;  // A4幅いっぱい
  const coverHeight = BOOK_DIMENSIONS.height;  // 148mm（縮小なし）

  // 背景を白で塗りつぶし
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, 'F');

  // Canvas APIでパターンを描画
  const canvas = document.createElement('canvas');
  const canvasWidth = 1200;  // 高解像度（297mm × 4）
  const canvasHeight = Math.floor(coverHeight * 4);  // 148 * 4 = 592px
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // 背景を白で塗りつぶし
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // パターンを描画
  if (typeof drawPattern === 'function') {
    drawPattern(ctx, pattern, canvasWidth, canvasHeight, color);
  }

  // ユーザー画像を描画
  if (userImage && imagePosition && imageScale) {
    const scale = imageScale / 100;
    const imgWidth = userImage.width * scale;
    const imgHeight = userImage.height * scale;
    const x = (imagePosition.x / 200) * canvasWidth - imgWidth / 2;
    const y = (imagePosition.y / 200) * canvasHeight - imgHeight / 2;
    ctx.drawImage(userImage, x, y, imgWidth, imgHeight);
  }

  // Canvasを画像としてPDFに挿入
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // 上端に配置（下だけ裁断すればOK）
  const x = 0;
  const y = 0;  // 上端
  doc.addImage(imgData, 'JPEG', x, y, coverWidth, coverHeight);
}

/**
 * ページ2を描画（折り線・トンボ）
 */
function drawPage2(doc, pattern, color) {
  // A4横向き: 297mm × 210mm
  // 横方向の縮小率
  const SCALE_X = 297 / 312;
  const coverHeight = BOOK_DIMENSIONS.height;  // 148mm（縮小なし）

  // 背景を白で塗りつぐし
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, 'F');

  // 薄い背景パターンを描画（opacity: 0.1相当）
  const canvas = document.createElement('canvas');
  const canvasWidth = 1200;
  const canvasHeight = Math.floor(coverHeight * 4);  // 148 * 4 = 592px
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  // 背景を白で塗りつぶし
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 薄いパターンを描画（色を薄くする）
  if (typeof drawPattern === 'function') {
    // 元の色から薄い色を生成
    const lightColor = lightenColor(color, 0.9);  // 90%明るく
    drawPattern(ctx, pattern, canvasWidth, canvasHeight, lightColor);
  }

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const y = 0;  // 上端に配置
  doc.addImage(imgData, 'JPEG', 0, y, 297, coverHeight);

  // 折り線（点線、濃い灰色）
  doc.setDrawColor(128, 128, 128);
  doc.setLineDash([2, 2]);
  doc.setLineWidth(0.5);

  // 縦方向の折り線（横方向のみ縮小）
  // 端の折り返しを少し小さくして端寄りに配置（35mm）
  const foldMargin = 35 * SCALE_X;     // 約33.3mm（端寄りに）
  const bookWidth = BOOK_DIMENSIONS.width * SCALE_X;    // 約99.9mm
  const spine = BOOK_DIMENSIONS.spine * SCALE_X;        // 約11.4mm

  const foldLines = [
    foldMargin,                           // 左折り返しの端（左表紙の開始）
    foldMargin + bookWidth,               // 背の左端
    foldMargin + bookWidth + spine,       // 背の右端
    foldMargin + bookWidth + spine + bookWidth  // 右折り返しの開始
  ];

  foldLines.forEach(x => {
    doc.line(x, y, x, y + coverHeight);
  });

  // 下部の裁断線（実線）
  doc.setLineDash([]);  // 実線
  doc.setDrawColor(0, 0, 0);  // 黒
  doc.setLineWidth(0.3);
  doc.line(0, y + coverHeight, 297, y + coverHeight);  // 下部裁断線

  // 説明テキスト（日本語をCanvasで描画して画像として挿入）
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 800;
  textCanvas.height = 80;
  const textCtx = textCanvas.getContext('2d');

  // 背景を白に
  textCtx.fillStyle = '#ffffff';
  textCtx.fillRect(0, 0, textCanvas.width, textCanvas.height);

  // 日本語テキストを描画
  textCtx.fillStyle = '#505050';
  textCtx.font = '16px sans-serif';
  textCtx.fillText('1. 4本の点線に沿って折り曲げてください', 10, 25);
  textCtx.fillText('2. 下端の実線に沿って裁断してください', 10, 50);

  // Canvasを画像としてPDFに挿入
  const textImgData = textCanvas.toDataURL('image/png');
  doc.addImage(textImgData, 'PNG', 5, y + coverHeight + 5, 100, 10);
}

/**
 * 色を明るくする
 */
function lightenColor(hexColor, amount) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Node.js環境（テスト用）でエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateBookCoverPDF, BOOK_DIMENSIONS };
}
