import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTitle } from '@talisoft/ui/title';
import { AgenciesApiService } from '@talisoft/api/lotchen-client-api';

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
      .agenciesControllerFindAllAgenciesV1()
      .subscribe((agencies) => console.log(agencies));
  }
}
