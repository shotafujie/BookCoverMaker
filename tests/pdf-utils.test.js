const { generateBookCoverPDF, BOOK_DIMENSIONS } = require('../js/pdf-utils.js');

describe('pdf-utils.js', () => {
  describe('BOOK_DIMENSIONS', () => {
    test('正しい寸法定数を持つ', () => {
      expect(BOOK_DIMENSIONS.width).toBe(105);
      expect(BOOK_DIMENSIONS.height).toBe(148);
      expect(BOOK_DIMENSIONS.spine).toBe(12);
      expect(BOOK_DIMENSIONS.foldMargin).toBe(45);
      expect(BOOK_DIMENSIONS.topBottomMargin).toBe(3);
    });
  });

  describe('generateBookCoverPDF', () => {
    test('PDFが生成される', async () => {
      const options = {
        pattern: 'grid',
        color: '#000000'
      };

      const result = await generateBookCoverPDF(options);

      // Blobまたは何らかの結果が返されることを確認
      expect(result).toBeDefined();
    });
  });
});
