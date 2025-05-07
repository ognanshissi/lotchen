import { Component, inject } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { AddTaskDialogData } from './add-task.service';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';

@Component({
  selector: 'common-add-task-dialog',
  templateUrl: './add-task-dialog.component.html',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    ButtonModule,
    FormField,
    TasInput,
    TasLabel,
  ],
})
export class AddTaskDialogComponent {
  private data: AddTaskDialogData = inject(DIALOG_DATA);

  constructor() {
    console.log('AddTaskDialogComponent', this.data);
  }
}
