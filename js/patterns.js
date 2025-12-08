/**
 * 柄パターンライブラリ
 * Canvas上に柄パターンを描画する関数群を提供
 */

const patterns = {
  none: {
    name: '柄なし（無地）',
    draw: function(ctx, width, height, color) {
      // 単色で塗りつぶし
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
  },
  grid: {
    name: 'グリッド',
    draw: function(ctx, width, height, color) {
      const gridSize = 20;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      // 縦線を描画
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 横線を描画
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  },
  dots: {
    name: 'ドット',
    draw: function(ctx, width, height, color) {
      const dotSpacing = 20;
      const dotRadius = 3;
      ctx.fillStyle = color;

      // ドットを描画
      for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  },
  'stripes-horizontal': {
    name: '横ストライプ',
    draw: function(ctx, width, height, color) {
      const stripeWidth = 15;
      ctx.fillStyle = color;

      for (let y = 0; y < height; y += stripeWidth * 2) {
        ctx.fillRect(0, y, width, stripeWidth);
      }
    }
  },
  'stripes-vertical': {
    name: '縦ストライプ',
    draw: function(ctx, width, height, color) {
      const stripeWidth = 15;
      ctx.fillStyle = color;

      for (let x = 0; x < width; x += stripeWidth * 2) {
        ctx.fillRect(x, 0, stripeWidth, height);
      }
    }
  },
  checkerboard: {
    name: 'チェッカー',
    draw: function(ctx, width, height, color) {
      const squareSize = 20;
      ctx.fillStyle = color;

      for (let y = 0; y < height; y += squareSize) {
        for (let x = 0; x < width; x += squareSize) {
          if ((x / squareSize + y / squareSize) % 2 === 0) {
            ctx.fillRect(x, y, squareSize, squareSize);
          }
        }
      }
    }
  },
  diagonal: {
    name: '斜線',
    draw: function(ctx, width, height, color) {
      const spacing = 20;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      // 右下がりの斜線
      for (let i = -height; i < width; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
    }
  },
  zigzag: {
    name: 'ジグザグ',
    draw: function(ctx, width, height, color) {
      const zigzagWidth = 20;
      const zigzagHeight = 15;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let y = 0; y < height; y += zigzagHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += zigzagWidth) {
          ctx.lineTo(x + zigzagWidth / 2, y + zigzagHeight / 2);
          ctx.lineTo(x + zigzagWidth, y);
        }
        ctx.stroke();
      }
    }
  },
  hexagon: {
    name: 'ヘキサゴン',
    draw: function(ctx, width, height, color) {
      const hexSize = 15;
      const hexHeight = hexSize * Math.sqrt(3);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      for (let y = 0; y < height + hexHeight; y += hexHeight * 1.5) {
        for (let x = 0; x < width + hexSize * 2; x += hexSize * 3) {
          const offsetX = (y / (hexHeight * 1.5)) % 2 === 0 ? 0 : hexSize * 1.5;
          drawHexagon(ctx, x + offsetX, y, hexSize);
        }
      }

      function drawHexagon(ctx, cx, cy, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = cx + size * Math.cos(angle);
          const y = cy + size * Math.sin(angle);
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  },
  wave: {
    name: '波模様',
    draw: function(ctx, width, height, color) {
      const waveHeight = 20;
      const waveLength = 40;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let y = 0; y < height; y += waveHeight * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 1) {
          const waveY = y + Math.sin((x / waveLength) * Math.PI * 2) * waveHeight;
          ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
    }
  },
  triangle: {
    name: '三角形',
    draw: function(ctx, width, height, color) {
      const triangleSize = 25;
      const triangleHeight = (triangleSize * Math.sqrt(3)) / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      for (let y = 0; y < height + triangleHeight; y += triangleHeight) {
        for (let x = 0; x < width + triangleSize; x += triangleSize) {
          const offsetX = (y / triangleHeight) % 2 === 0 ? 0 : triangleSize / 2;

          // 上向き三角形
          ctx.beginPath();
          ctx.moveTo(x + offsetX, y + triangleHeight);
          ctx.lineTo(x + triangleSize / 2 + offsetX, y);
          ctx.lineTo(x + triangleSize + offsetX, y + triangleHeight);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  }
};

/**
 * 指定されたパターンをCanvasに描画する
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D コンテキスト
 * @param {string} patternName - パターン名
 * @param {number} width - 描画幅（px）
 * @param {number} height - 描画高さ（px）
 * @param {string} color - 色（例: '#ff5500'）
 */
function drawPattern(ctx, patternName, width, height, color) {
  const pattern = patterns[patternName];
  if (!pattern) {
    throw new Error(`Pattern "${patternName}" not found`);
  }
  pattern.draw(ctx, width, height, color);
}

// Node.js環境（テスト用）でエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { drawPattern, patterns };
}
