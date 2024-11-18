import { Component } from '@angular/core';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '../../../../shared/ui/side-drawer';
import { TasTitle } from '../../../../shared/ui/title';
import { ButtonModule } from '../../../../shared/ui/button';
import { FormField, TasLabel } from '../../../../shared/ui/form-field';
import { TasText } from '../../../../shared/ui/text';
import { TasInput, TasNativeSelect } from '../../../../shared/ui/input';

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
          <div class="flex space-x-2">
            <tas-form-field>
              <tas-label>Nom</tas-label>
              <input type="text" tasInput placeholder="Nom" />
            </tas-form-field>

            <tas-form-field>
              <tas-label>Prenom</tas-label>
              <input type="text" tasInput placeholder="Prénom" />
            </tas-form-field>
          </div>

          <tas-form-field>
            <tas-label>Date de naissance</tas-label>
            <input type="date" tasInput placeholder="Date de naissaince" />
          </tas-form-field>

          <div class="flex space-x-2">
            <tas-form-field>
              <tas-label>Genre</tas-label>
              <select tasNativeSelect>
                <option>Homme</option>
                <option>Femme</option>
              </select>
            </tas-form-field>

            <tas-form-field>
              <tas-label>Etat civil</tas-label>
              <input type="text" tasInput placeholder="Etat civil" />
            </tas-form-field>
          </div>
        </div>

        <tas-drawer-action>
          <button tas-outlined-button closable-drawer>Fermer</button>
          <button tas-raised-button color="primary" isLoading="true">
            Enregistrer
          </button>
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
    TasText,
    TasInput,
    TasNativeSelect,
  ],
  standalone: true,
})
export class QuickAddComponent {}
