import { Component, inject, signal } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SnackbarService } from '@talisoft/ui/snackbar';

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
          title: 'Automatisations',
          type: 'basic',
          id: 'groups_workflows',
          link: '/settings/workflow-automations/templates',
          description:
            'Gerer les automatismes dans le cycle de vie des contacts et clients',
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
      children: [
        {
          title: 'Produits',
          type: 'basic',
          id: 'products_services_products',
          link: '/settings/products',
          description: 'Gérer les produits et services des votre entreprise',
        },
      ],
    },
    {
      title: 'Données & Importation',
      type: 'group',
      isActive: false,
      id: 'data_import',
      description: 'Gestion des importations des leads, contacts, utilisateurs',
      children: [
        {
          title: 'Importer les utilisateurs',
          type: 'basic',
          id: 'data_import_users',
          link: '/settings/import-users',
          description: 'Importer les utilisateurs depuis différentes sources',
        },
        {
          title: 'Importer les contacts',
          type: 'basic',
          id: 'data_import_contacts',
          link: '/settings/import-contacts',
          description: 'Importer les contacts depuis différentes sources',
        },
        {
          title: 'Importer les clients',
          type: 'basic',
          id: 'data_import_clients',
          link: '/settings/import-clients',
          description: 'Importer les clients depuis différentes sources',
        },
      ],
    },
    {
      title: 'Canaux de communication',
      type: 'group',
      id: 'channels',
      description:
        'Gérer vos differents canaux de communication avec vos prospect, clients',
      children: [
        {
          title: 'WhatsApp',
          type: 'basic',
          id: 'communication_channels_whatsapp',
          link: '/settings/whatsapp-configuration',
          description: 'Configurer votre compte whatsapp entreprise.',
        },
      ],
    },
    {
      title: 'Réglages de compte',
      type: 'group',
      id: 'account_settings',
      description:
        'Paramétrage global du compte, facturation, et souscription ',
      children: [
        {
          title: 'Monnaie',
          type: 'basic',
          id: 'account_settings_currency',
          link: '/settings/currency',
          description: 'Gérer les differentes devises et monnaie',
        },
        {
          title: 'Tags',
          type: 'basic',
          id: 'account_settings_tags',
          link: '/settings/tags',
          description: "Gérer l'ensemble des tags",
        },
        {
          title: 'Webhooks',
          type: 'basic',
          id: 'account_settings_webhooks',
          link: '/settings/webhooks',
          description:
            'Utiliser des webhooks pour faire parvenir vos données dans differents services',
        },
        {
          title: 'Plan et Facturation',
          type: 'basic',
          id: 'account_settings_billing',
          link: '/settings/plan-facturation',
          description: 'Gerer vos plan et facturations',
        },
      ],
    },
  ];

  private readonly _snackbarService = inject(SnackbarService);

  public menus = signal<MenuItem[]>(this.menuData);

  public selectedMenu = signal<MenuItem>(this.menuData[0]);

  public toggleSelectedMenuGroup(item: MenuItem) {
    this.selectedMenu.set(item);
  }
}

export default OverviewComponent;
