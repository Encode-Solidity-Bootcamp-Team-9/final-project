import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber, ethers } from 'ethers';

@Pipe({
  name: 'toETH',
  standalone: true
})
export class ToETHPipe implements PipeTransform {
  transform(value: BigNumber | string | undefined): string {
    if (value === undefined) {
      return '0';
    }
    if (typeof value === 'string') {
      return value;
    }
    let str = ethers.utils.formatEther(value);
    const representation = str.split('.');
    str = representation[0];
    if (representation.length > 1) {
      str += '.' + representation[1].substring(0, 2);
    }
    return str;
  }
}
