import { Component } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';

@Component({
  selector: 'prospects-import-contact-dialog',
  templateUrl: './import-contact-dialog.component.html',
  standalone: true,
  imports: [
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    ButtonModule,
    TasTitle,
    TasCard,
  ],
})
export class ImportContactDialogComponent {
  /**
   * Method to download the template file
   */
  public downloadTemplate(): void {
    // Logic to download the template file
    const link = document.createElement('a');
    link.href = 'path/to/your/template.xlsx'; // Replace with the actual path to your template file
    link.download = 'contact_import_template.xlsx'; // The name for the downloaded file
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
