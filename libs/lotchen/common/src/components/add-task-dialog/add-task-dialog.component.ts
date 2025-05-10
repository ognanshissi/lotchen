import { Component, inject, OnInit } from '@angular/core';
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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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
    ReactiveFormsModule,
  ],
})
export class AddTaskDialogComponent implements OnInit {
  private data: AddTaskDialogData = inject(DIALOG_DATA);

  public addTaskForm!: FormGroup;

  constructor() {
    console.log('AddTaskDialogComponent', this.data);
  }

  public ngOnInit(): void {
    this.addTaskForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      dueDate: new FormControl(null, [Validators.required]),
      dueDateTime: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
    });
  }

  public handleSubmit() {
    console.log(this.addTaskForm.value);
  }
}
