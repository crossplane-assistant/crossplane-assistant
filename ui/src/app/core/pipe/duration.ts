import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) {
      return '';
    }

    let valueDate: Date | undefined;
    if (typeof value == 'string' || typeof value == 'number') {
      valueDate = new Date(value);
    } else if (value instanceof Date) {
      valueDate = value as Date;
    } else {
      return '';
    }

    return this.shortHumanDuration(valueDate);
  }

  shortHumanDuration(date: Date): string {
    let now = new Date();

    let duration = (now.getTime() - date.getTime()) / 1000;

    if (duration < -1) {
      return '<invalid>';
    }

    // duration in seconds
    if (duration < 0) {
      return 'Os';
    }

    const seconds = duration;
    // duration in seconds
    if (seconds < 60) {
      return `${seconds}s`;
    }

    // duration in minutes
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.round(hours / 24);
    if (days < 365) {
      return `${days}d`;
    }

    const years = Math.round(days / 365);
    return `${years}y`;
  }
}
