import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Anchor, Button } from './button';

const DECLARATIONS = [Button, Anchor];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [CommonModule],
  exports: [...DECLARATIONS],
})
export class ButtonModule {}
