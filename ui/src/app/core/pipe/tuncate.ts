import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateName' })
export class TruncateNamePipe implements PipeTransform {
  transform(
    value: any,
    length: number,
    strategy: string = 'middle',
    separator: string = '...'
  ): string {
    if (!value || value.length <= length) {
      return value;
    }

    const nbkeptChars = length - separator.length;

    switch (strategy) {
      case 'middle':
        const headChars = Math.ceil(nbkeptChars / 2);
        const tailChars = nbkeptChars - headChars;
        return (
          value.slice(0, headChars) +
          separator +
          value.slice(value.length - tailChars)
        );
      case 'begin':
        return value.slice(0, nbkeptChars) + separator;

      case 'end':
        return separator + value.slice(value.length - nbkeptChars);
    }
    return value;
  }
}
