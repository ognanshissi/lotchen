import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from '@talisoft/ui/button';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { TasText } from '@talisoft/ui/text';
import { TasTitle } from '@talisoft/ui/title';

@Component({
  selector: 'lib-containers',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TasCard,
    TasCardHeader,
    TasIcon,
    TasText,
    TasTitle,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  public openQuickAddTask(): void {}
}

export default TasksComponent;
