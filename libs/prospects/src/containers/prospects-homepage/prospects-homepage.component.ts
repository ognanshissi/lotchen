import { Component, inject } from '@angular/core';
import { TasTitle } from '../../../../shared/ui/title';
import { TasText } from '../../../../shared/ui/text';
import { ButtonModule } from '../../../../shared/ui/button';
import { TasIcon } from '../../../../shared/ui/icon';
import { SideDrawerService } from '../../../../shared/ui/side-drawer';
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
