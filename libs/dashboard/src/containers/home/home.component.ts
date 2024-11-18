import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from '../../../../shared/ui/button';
import { TasTitle } from '../../../../shared/ui/title';
import { AgenciesApiService } from '@talisoft/api';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [ButtonModule, TasTitle],
})
export class HomeComponent implements OnInit {
  private readonly _agenciesApiService = inject(AgenciesApiService);

  public ngOnInit() {
    this._agenciesApiService
      .allAgency()
      .subscribe((agencies) => console.log(agencies));
  }
}
