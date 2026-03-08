import { Component, computed, inject, OnInit } from '@angular/core';
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
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TasDatePicker } from '@talisoft/ui/date-picker';
import { AuthenticationService } from '../../services/authentication.service';
import { TasksApiService } from '@talisoft/api/lotchen-client-api';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';

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
    TasDatePicker,
  ],
})
export class AddTaskDialogComponent implements OnInit {
  private readonly _authService = inject(AuthenticationService);
  private readonly _taskApi = inject(TasksApiService);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _data = inject(DIALOG_DATA);

  public readonly currentUser = computed(() =>
    this._authService.connectedUser()
  );

  public addTaskForm!: FormGroup;

  public ngOnInit(): void {
    console.log(this._data);
    console.log(this.currentUser());
    this.addTaskForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      dueDate: new FormControl(null, [Validators.required]),
      dueDateTime: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      assigneeIds: new FormControl<string[]>([]),
    });
  }

  public handleSubmit(): void {
    this._taskApi
      .tasksControllerCreateTaskV1({
        ownerId: this.currentUser()?.userId,
        taskType: 'other',
        relatedToId: this._data.relatedToId,
        relatedToType: this._data.relatedToType,
        ...this.addTaskForm.value,
      })
      .subscribe({
        next: (response) => {
          console.log(response);
          this._dialogRef.close(response);
          this._snackbar.success(
            'Felicitations !',
            'Task created successfully'
          );
        },
        error: (error) => {
          console.error('Failed to create task:', error);
          // this._dialogRef.close();
          this._snackbar.error('Oops', 'Failed to create task');
        },
      });
  }
}
