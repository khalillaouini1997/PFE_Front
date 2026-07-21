import {isProblemDetail} from './problem-detail.model';

describe('problem-detail.model', () => {
  describe('isProblemDetail', () => {
    it('should return true for valid ProblemDetail', () => {
      expect(isProblemDetail({status: 400, detail: 'Bad request'})).toBe(true);
    });

    it('should return true with all optional fields', () => {
      expect(isProblemDetail({
        type: 'https://example.com/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
        instance: '/api/users/123'
      })).toBe(true);
    });

    it('should return false for null', () => {
      expect(isProblemDetail(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isProblemDetail(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isProblemDetail('error')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isProblemDetail(400)).toBe(false);
    });

    it('should return false when status is missing', () => {
      expect(isProblemDetail({detail: 'error'})).toBe(false);
    });

    it('should return false when detail is missing', () => {
      expect(isProblemDetail({status: 400})).toBe(false);
    });

    it('should return false when status is not a number', () => {
      expect(isProblemDetail({status: '400', detail: 'error'})).toBe(false);
    });

    it('should return false when detail is not a string', () => {
      expect(isProblemDetail({status: 400, detail: 123})).toBe(false);
    });
  });
});
