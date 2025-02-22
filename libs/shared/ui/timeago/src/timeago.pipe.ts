import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance } from 'date-fns';

@Pipe({
  name: 'dateTimeAgo',
  standalone: true,
})
export class TimeagoPipe implements PipeTransform {
  transform(value: any) {
    return formatDistance(value, new Date(), {
      addSuffix: true,
      includeSeconds: true,
    });
  }
}
