import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';

@Component({
  selector: 'settings-add-territory-dialog',
  templateUrl: './add-territory-dialog.component.html',
  standalone: true,
  imports: [
    ButtonModule,
    FormField,
    TasClosableDrawer,
    TasDrawerAction,
    TasIcon,
    TasSideDrawer,
    TasTitle,
    TasText,
    TasDrawerTitle,
    TasDrawerContent,
    TasLabel,
  ],
})
export class AddTerritoryDialogComponent {}
