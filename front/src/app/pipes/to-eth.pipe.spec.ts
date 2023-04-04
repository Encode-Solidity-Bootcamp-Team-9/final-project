import { ToETHPipe } from './to-eth.pipe';

describe('ToEthPipe', () => {
  it('create an instance', () => {
    const pipe = new ToETHPipe();
    expect(pipe).toBeTruthy();
  });
});
