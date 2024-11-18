import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive } from '@angular/core';

@Directive({
  selector: '[MenuTrigger]',
  standalone: true,
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: panel'],
    },
  ],
})
export class TasMenuTrigger {}
