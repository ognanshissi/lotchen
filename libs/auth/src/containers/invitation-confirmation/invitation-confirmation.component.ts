import { Component, OnInit } from '@angular/core';
import { TasTitle } from '../../../../shared/ui/title';
import { TasAlert } from '../../../../shared/ui/alert';
import { ButtonModule } from '../../../../shared/ui/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'auth-invitation-confirmation',
  template: `
    <div class="flex flex-col space-y-5">
      <tas-title class="text-center"
        >Confirmation de votre invitation</tas-title
      >

      <tas-alert type="success">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda
        blanditiis consequatur culpa cumque cupiditate distinctio eos ex fugiat
        illo ipsum magni maxime minima, porro ratione sequi totam voluptatum.
        Ducimus, voluptatibus!
      </tas-alert>

      <div class="flex justify-end">
        <button
          tas-filled-button
          size="large"
          color="primary"
          [routerLink]="['/auth', 'login']"
        >
          Vous pouvez vous connectez maintenant
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [TasTitle, TasAlert, ButtonModule, RouterLink],
})
export class InvitationConfirmationComponent implements OnInit {
  ngOnInit() {
    console.log('Invitation Confirmation');
  }
}

export default InvitationConfirmationComponent;
