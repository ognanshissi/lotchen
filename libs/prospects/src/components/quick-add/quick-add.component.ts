import { Component } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInputEmail } from '@talisoft/ui/input-email';
import { TasText } from '@talisoft/ui/text';
import { TasInput } from '@talisoft/ui/input';

@Component({
  selector: 'prospects-quick-add',
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Ajouter un prospect</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. A accusamus,
          excepturi fuga fugit harum ipsum minus molestiae nobis possimus!
        </Text>

        <div class="flex flex-col gap-3">
          <tas-form-field>
            <tas-label>Nom</tas-label>
            <input type="text" tasInput placeholder="Nom" />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Prenom</tas-label>
            <input type="text" tasInput placeholder="Prénom" />
          </tas-form-field>

          <tas-form-field>
            <tas-label>Numéro de téléphone</tas-label>
            <input type="text" tasInput placeholder="Numéro de téléphone" />
          </tas-form-field>

          <tas-input-email placeholder="Adresse électronique">
            Adresse électronique
          </tas-input-email>

          <tas-form-field>
            <tas-label>Zone géographique</tas-label>
            <input type="text" tasInput placeholder="Zone géographique" />
          </tas-form-field>
        </div>

        <tas-drawer-action>
          <button tas-outlined-button closable-drawer>Fermer</button>
          <button tas-raised-button color="primary">Enregistrer</button>
        </tas-drawer-action>
      </tas-drawer-content>
    </tas-side-drawer>
  `,
  imports: [
    TasSideDrawer,
    TasTitle,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    ButtonModule,
    TasClosableDrawer,
    FormField,
    TasLabel,
    TasInputEmail,
    TasText,
    TasInput,
  ],
  standalone: true,
})
export class QuickAddComponent {}
