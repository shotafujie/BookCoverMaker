/**
 * メインアプリケーション
 * UI操作の処理、状態管理、プレビュー更新
 */

// アプリケーション状態
const state = {
  selectedPattern: 'none',
  selectedColor: '#e8d5c4',  // 落ち着いたベージュ
  userImage: null,
  imagePosition: { x: 100, y: 100 },
  imageScale: 100
};

// DOM要素
let elements = {};

/**
 * アプリケーションを初期化
 */
function initApp() {
  // DOM要素を取得
  elements = {
    patternSelect: document.getElementById('pattern-select'),
    colorPicker: document.getElementById('color-picker'),
    colorText: document.getElementById('color-text'),
    dropZone: document.getElementById('drop-zone'),
    imageUpload: document.getElementById('image-upload'),
    imagePreview: document.getElementById('image-preview'),
    previewImg: document.getElementById('preview-img'),
    removeImage: document.getElementById('remove-image'),
    imageControls: document.getElementById('image-controls'),
    imageX: document.getElementById('image-x'),
    imageY: document.getElementById('image-y'),
    imageScale: document.getElementById('image-scale'),
    downloadPdf: document.getElementById('download-pdf'),
    previewCanvas: document.getElementById('preview-canvas')
  };

  // イベントリスナーを設定
  setupEventListeners();

  // 初期プレビューを描画
  updatePreview();
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // パターン選択
  elements.patternSelect.addEventListener('change', (e) => {
    state.selectedPattern = e.target.value;
    updatePreview();
  });

  // 色選択（カラーピッカー）
  elements.colorPicker.addEventListener('input', (e) => {
    state.selectedColor = e.target.value;
    elements.colorText.value = e.target.value;
    updatePreview();
  });

  // 色選択（テキスト入力）
  elements.colorText.addEventListener('input', (e) => {
    const color = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      state.selectedColor = color;
      elements.colorPicker.value = color;
      updatePreview();
    }
  });

  // ドラッグ&ドロップ
  elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('drag-over');
  });

  elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('drag-over');
  });

  elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  // ファイル選択
  elements.imageUpload.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  });

  // 画像削除
  elements.removeImage.addEventListener('click', () => {
    removeImage();
  });

  // 画像位置・スケール調整
  elements.imageX.addEventListener('input', (e) => {
    state.imagePosition.x = parseInt(e.target.value, 10);
    updatePreview();
  });

  elements.imageY.addEventListener('input', (e) => {
    state.imagePosition.y = parseInt(e.target.value, 10);
    updatePreview();
  });

  elements.imageScale.addEventListener('input', (e) => {
    state.imageScale = parseInt(e.target.value, 10);
    updatePreview();
  });

  // PDFダウンロード
  elements.downloadPdf.addEventListener('click', async () => {
    await downloadPDF();
  });
}

/**
 * 画像ファイルを処理
 */
function handleImageFile(file) {
  if (!file.type.match('image.*')) {
    alert('画像ファイルを選択してください');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.userImage = img;
      elements.previewImg.src = e.target.result;
      elements.imagePreview.style.display = 'block';
      elements.imageControls.style.display = 'block';
      updatePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/**
 * 画像を削除
 */
function removeImage() {
  state.userImage = null;
  elements.imagePreview.style.display = 'none';
  elements.imageControls.style.display = 'none';
  elements.imageUpload.value = '';
  updatePreview();
}

/**
 * プレビューを更新
 */
function updatePreview() {
  const canvas = elements.previewCanvas;
  const ctx = canvas.getContext('2d');

  // キャンバスをクリア（白背景）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // パターンを描画（PDFページ1と同じ内容）
  drawPattern(ctx, state.selectedPattern, canvas.width, canvas.height, state.selectedColor);

  // ユーザー画像を描画
  if (state.userImage) {
    const scale = state.imageScale / 100;
    const imgWidth = state.userImage.width * scale;
    const imgHeight = state.userImage.height * scale;
    const x = (state.imagePosition.x / 200) * canvas.width - imgWidth / 2;
    const y = (state.imagePosition.y / 200) * canvas.height - imgHeight / 2;

    ctx.drawImage(state.userImage, x, y, imgWidth, imgHeight);
  }

  // 折り目の位置を薄く表示（参考用）
  drawFoldGuides(ctx, canvas.width, canvas.height);
}

/**
 * 折り目ガイド線を描画（参考用、薄く表示）
 */
function drawFoldGuides(ctx, width, height) {
  const SCALE_X = 297 / 312;  // PDFと同じ横方向の縮小率
  const foldMargin = 35 * SCALE_X;  // 端寄りに配置（33.3mm）
  const bookWidth = 105 * SCALE_X;
  const spine = 12 * SCALE_X;

  // 折り線の位置を計算（ピクセル座標に変換）
  const foldLines = [
    (foldMargin / 297) * width,                                    // 左折り返しの端
    ((foldMargin + bookWidth) / 297) * width,                      // 背の左端
    ((foldMargin + bookWidth + spine) / 297) * width,              // 背の右端
    ((foldMargin + bookWidth + spine + bookWidth) / 297) * width   // 右折り返しの開始
  ];

  // 薄い灰色の点線で描画
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  foldLines.forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  });

  // 点線をリセット
  ctx.setLineDash([]);
}

/**
 * PDFをダウンロード
 */
async function downloadPDF() {
  try {
    const options = {
      pattern: state.selectedPattern,
      color: state.selectedColor,
      userImage: state.userImage,
      imagePosition: state.imagePosition,
      imageScale: state.imageScale
    };

    const pdfBlob = await generateBookCoverPDF(options);

    // ダウンロード
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookcover.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('PDFをダウンロードしました！');
  } catch (error) {
    console.error('PDF生成エラー:', error);
    alert('PDFの生成に失敗しました。もう一度お試しください。');
  }
}

// DOMContentLoadedイベントでアプリを初期化
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}

// Node.js環境（テスト用）でエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initApp, state };
}
