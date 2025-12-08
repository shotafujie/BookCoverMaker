const { drawPattern, patterns } = require('../js/patterns.js');

describe('patterns.js', () => {
  let canvas;
  let ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    ctx = canvas.getContext('2d');
  });

  describe('drawPattern', () => {
    test('grid パターンが指定サイズで描画される', () => {
      const width = 200;
      const height = 200;
      const color = '#000000';

      // テストを実行
      drawPattern(ctx, 'grid', width, height, color);

      // Canvas に何か描画されたことを確認（fillRect または strokeRect が呼ばれている）
      // jest-canvas-mock を使用しているため、描画メソッドの呼び出しを検証可能
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('dots パターンが指定色で描画される', () => {
      const width = 200;
      const height = 200;
      const color = '#ff5500';

      // テストを実行
      drawPattern(ctx, 'dots', width, height, color);

      // Canvas に何か描画されたことを確認
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('stripes-horizontal パターンが描画される', () => {
      drawPattern(ctx, 'stripes-horizontal', 200, 200, '#0000ff');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('stripes-vertical パターンが描画される', () => {
      drawPattern(ctx, 'stripes-vertical', 200, 200, '#00ff00');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('checkerboard パターンが描画される', () => {
      drawPattern(ctx, 'checkerboard', 200, 200, '#ff00ff');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('diagonal パターンが描画される', () => {
      drawPattern(ctx, 'diagonal', 200, 200, '#ffff00');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('zigzag パターンが描画される', () => {
      drawPattern(ctx, 'zigzag', 200, 200, '#00ffff');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('hexagon パターンが描画される', () => {
      drawPattern(ctx, 'hexagon', 200, 200, '#ff5500');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('wave パターンが描画される', () => {
      drawPattern(ctx, 'wave', 200, 200, '#5500ff');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('triangle パターンが描画される', () => {
      drawPattern(ctx, 'triangle', 200, 200, '#55ff00');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('none パターンが描画される（無地）', () => {
      drawPattern(ctx, 'none', 200, 200, '#ffffff');
      expect(ctx.__getDrawCalls()).not.toHaveLength(0);
    });

    test('存在しないパターン名でエラーを返す', () => {
      expect(() => {
        drawPattern(ctx, 'nonexistent', 200, 200, '#000000');
      }).toThrow('Pattern "nonexistent" not found');
    });
  });
});
