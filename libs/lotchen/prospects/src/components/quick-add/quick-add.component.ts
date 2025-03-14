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
import { TasText } from '@talisoft/ui/text';
import { TasInput, TasNativeSelect } from '@talisoft/ui/input';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'prospects-quick-add',
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Ajouter un contact</tas-title>
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
      </tas-drawer-content>
      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon [iconName]="'close'"></tas-icon>
          Fermer
        </button>
        <button tas-raised-button color="primary">
          <tas-icon iconName="check"></tas-icon>
          sauvegarder
        </button>
      </tas-drawer-action>
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
    TasIcon,
  ],
  standalone: true,
})
export class QuickAddComponent {}
