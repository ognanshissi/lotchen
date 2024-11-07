import { Component, inject } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { SideDrawerService } from '@talisoft/ui/side-drawer';
import { QuickAddComponent } from '../../components/quick-add/quick-add.component';

@Component({
  selector: 'prospects-homepage',
  standalone: true,
  templateUrl: './prospects-homepage.component.html',
  imports: [TasTitle, TasText, ButtonModule, TasIcon],
})
export class ProspectsHomepageComponent {
  private readonly _sideDrawerService = inject(SideDrawerService);

  openQuickAdd() {
    this._sideDrawerService.open(QuickAddComponent).closed.subscribe((res) => {
      console.log(res);
    });
  }
}


export default ProspectsHomepageComponent;
