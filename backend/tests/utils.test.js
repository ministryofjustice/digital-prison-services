const { sortAlphaNum } = require('../utils');

describe('sortAlphaNum', () => {
  it('should sort list correctly', () => {
    const data = [
      'WORKSHOP 11',
      'WORKSHOP 10',
      'WORKSHOP 55',
    ];

    const result = data.sort(sortAlphaNum);

    const expected = [
      'WORKSHOP 10',
      'WORKSHOP 11',
      'WORKSHOP 55'
    ];

    expect(result).toEqual(expected);
  });
});
