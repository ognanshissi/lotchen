import { Component, inject, OnInit, signal } from '@angular/core';
import { TasTitle } from '@talisoft/ui/title';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { Dialog } from '@angular/cdk/dialog';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  EventTypesApiService,
  FindAllEventTypesQueryResponse,
} from '@talisoft/api/lotchen-client-api';
import { AddEventTypeDialogComponent } from '../../components/add-event-type-dialog/add-event-type-dialog.component';
import { TasText } from '@talisoft/ui/text';

@Component({
  selector: 'settings-event-types',
  standalone: true,
  imports: [TasTitle, TasText, TasCard, TasIcon, ButtonModule],
  template: `
    <div class="py-8 px-6 bg-white">
      <div class="flex justify-between items-center">
        <div>
          <tas-title>Types d'événements</tas-title>
          <tas-text
            >Configurer les types d'événements utilisés pour la
            planification</tas-text
          >
        </div>
        <button tas-raised-button color="primary" (click)="openAddDialog()">
          <tas-icon iconName="feather:plus"></tas-icon>
          Ajouter un type
        </button>
      </div>
    </div>

    <div class="p-6">
      <tas-card>
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">Nom</th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Icône
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Couleur
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Durée par défaut
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Système
              </th>
              <th class="py-3 px-4 font-semibold text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            @for (eventType of eventTypes(); track eventType.id) {
            <tr class="border-b border-gray-100 hover:bg-gray-50">
              <td class="py-3 px-4 font-medium">{{ eventType.name }}</td>
              <td class="py-3 px-4">
                <tas-icon [iconName]="eventType.icon"></tas-icon>
              </td>
              <td class="py-3 px-4">
                <span
                  class="inline-block w-6 h-6 rounded-full border border-gray-200"
                  [style.backgroundColor]="eventType.color"
                ></span>
              </td>
              <td class="py-3 px-4">
                {{ eventType.defaultDurationMinutes }} min
              </td>
              <td class="py-3 px-4">
                @if (eventType.isSystem) {
                <span
                  class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >Système</span
                >
                }
              </td>
              <td class="py-3 px-4 flex gap-2">
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0"
                  (click)="openEditDialog(eventType)"
                >
                  <tas-icon iconName="feather:edit-2"></tas-icon>
                </button>
                @if (!eventType.isSystem) {
                <button
                  tas-outlined-button
                  class="!p-1 !min-w-0 !text-red-500"
                  (click)="deleteEventType(eventType)"
                >
                  <tas-icon iconName="feather:trash-2"></tas-icon>
                </button>
                }
              </td>
            </tr>
            }
          </tbody>
        </table>
      </tas-card>
    </div>
  `,
})
export class EventTypesComponent implements OnInit {
  private readonly _eventTypesApi = inject(EventTypesApiService);
  private readonly _dialog = inject(Dialog);
  private readonly _snackbar = inject(SnackbarService);

  public eventTypes = signal<FindAllEventTypesQueryResponse[]>([]);

  public ngOnInit(): void {
    this.loadEventTypes();
  }

  public loadEventTypes(): void {
    this._eventTypesApi.eventTypesControllerFindAllEventTypesV1().subscribe({
      next: (data) => this.eventTypes.set(data),
    });
  }

  public openAddDialog(): void {
    const ref = this._dialog.open(AddEventTypeDialogComponent, {
      width: '600px',
      data: { mode: 'create' },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadEventTypes();
    });
  }

  public openEditDialog(eventType: FindAllEventTypesQueryResponse): void {
    const ref = this._dialog.open(AddEventTypeDialogComponent, {
      width: '600px',
      data: { mode: 'edit', eventType },
    });
    ref.closed.subscribe((result) => {
      if (result) this.loadEventTypes();
    });
  }

  public deleteEventType(eventType: FindAllEventTypesQueryResponse): void {
    if (!confirm(`Supprimer le type "${eventType.name}" ?`)) return;
    this._eventTypesApi
      .eventTypesControllerDeleteEventTypeV1(eventType.id)
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', "Type d'événement supprimé");
          this.loadEventTypes();
        },
        error: () => {
          this._snackbar.error('Erreur', 'Impossible de supprimer le type');
        },
      });
  }
}

export default EventTypesComponent;
