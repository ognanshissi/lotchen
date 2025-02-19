import { Component, signal } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface MenuItem {
  title: string;
  icon?: string;
  id: string;
  link?: string;
  type: 'basic' | 'group';
  description?: string;
  isActive?: boolean;
  hidden?: (item: MenuItem) => boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'settings-overview',
  templateUrl: './overview.component.html',
  standalone: true,
  styles: [
    `
      .menu-group__active {
        background-color: rgba(var(--tas-color-primary), 0.2) !important;
      }
    `,
  ],
  imports: [TasTitle, TasText, NgIf, NgClass, RouterLink],
})
export class OverviewComponent {
  private readonly menuData: MenuItem[] = [
    {
      title: 'Leads, Contacts & Compte',
      type: 'group',
      description: 'Gestion des personnes et vos différents clients',
      id: 'leads_contacts_compte',
      children: [],
    },
    {
      title: 'Equipes & Territoires',
      type: 'group',
      id: 'teams_territories',
      description: 'Gestion des utilisateurs et groupes par territoires',
      children: [
        {
          title: 'Workflows',
          type: 'basic',
          id: 'teams_territories_workflows',
          link: '/settings/workflow-automations/templates',
          description: 'Gestion des utilisateurs et groupes par territoires',
        },
        {
          title: 'Utilisateurs',
          type: 'basic',
          id: 'teams_territories_users',
          link: '/settings/users',
          description: 'Gestion des utilisateurs et groupes par territoires',
        },
        {
          title: 'Roles',
          type: 'basic',
          id: 'teams_territories_roles',
          link: '/settings/roles',
          description: 'Gestion des utilisateurs et groupes par territoires',
        },
        {
          title: 'Equipes',
          type: 'basic',
          id: 'teams_territories_teams',
          link: '/settings/teams',
          description: 'Gestion des utilisateurs et groupes par territoires',
        },
        {
          title: 'Territoires',
          type: 'basic',
          id: 'teams_territories_territory',
          link: '/settings/territories',
          description: 'Gestion des utilisateurs et groupes par territoires',
        },
      ],
    },
    {
      title: 'Produits & Services',
      type: 'group',
      id: 'products_services',
      description: 'Gestion des produits et services',
      children: [],
    },
    {
      title: 'Données & Importation',
      type: 'group',
      id: 'data_import',
      description: 'Gestion des importations des leads, contacts, utilisateurs',
      children: [],
    },
    {
      title: 'Canaux de communication',
      type: 'group',
      id: 'channels',
      description:
        'Gerer vos differents canaux de communication avec vos prospect, clients',
      children: [],
    },
    {
      title: 'Réglages de compte',
      type: 'group',
      id: 'account_settings',
      description:
        'Parametrage global du compte, facturation, et souscription ',
      children: [],
    },
  ];

  public menus = signal<MenuItem[]>(this.menuData);

  public selectedMenu = signal<MenuItem>(this.menuData[0]);

  public toggleSelectedMenuGroup(item: MenuItem) {
    this.selectedMenu.set(item);
  }

  protected readonly screenLeft = screenLeft;
}

export default OverviewComponent;
