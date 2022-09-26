import { NegativNumberPipe } from './negativ-number.pipe';

describe('NegativNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new NegativNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
