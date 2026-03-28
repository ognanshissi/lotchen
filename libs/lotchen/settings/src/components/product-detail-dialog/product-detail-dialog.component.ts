import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TasClosableDrawer,
  TasDrawerAction,
  TasDrawerContent,
  TasDrawerTitle,
  TasSideDrawer,
} from '@talisoft/ui/side-drawer';
import { TasIcon } from '@talisoft/ui/icon';
import { TasTitle } from '@talisoft/ui/title';
import { ButtonModule } from '@talisoft/ui/button';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ProductResponse } from '../../containers/products/products.interfaces';

export interface ProductDetailDialogData {
  product: ProductResponse;
}

@Component({
  selector: 'settings-product-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TasSideDrawer,
    TasDrawerTitle,
    TasDrawerContent,
    TasDrawerAction,
    TasIcon,
    TasClosableDrawer,
    TasTitle,
    ButtonModule,
  ],
  template: `
    <tas-side-drawer>
      <tas-drawer-title>
        <tas-title>Détails du produit</tas-title>
      </tas-drawer-title>
      <tas-drawer-content>
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-semibold">{{ data.product.name }}</h3>
            <div class="flex gap-2 mt-2">
              <span
                class="text-xs px-2 py-1 rounded-full"
                [class.bg-gray-100]="data.product.status === 'draft'"
                [class.text-gray-600]="data.product.status === 'draft'"
                [class.bg-green-100]="data.product.status === 'active'"
                [class.text-green-800]="data.product.status === 'active'"
                [class.bg-orange-100]="data.product.status === 'deprecated'"
                [class.text-orange-800]="data.product.status === 'deprecated'"
                >{{ getStatusLabel(data.product.status) }}</span
              >
              <span
                class="text-xs px-2 py-1 rounded-full"
                [class.bg-yellow-100]="data.product.environment === 'sandbox'"
                [class.text-yellow-800]="data.product.environment === 'sandbox'"
                [class.bg-blue-100]="data.product.environment === 'production'"
                [class.text-blue-800]="
                  data.product.environment === 'production'
                "
                >{{
                  data.product.environment === 'sandbox'
                    ? 'Sandbox'
                    : 'Production'
                }}</span
              >
            </div>
          </div>

          <div class="border-t pt-4 space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Type</span>
              <span class="text-sm font-medium">{{
                getTypeLabel(data.product.type)
              }}</span>
            </div>

            @if (data.product.description) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Description</span>
              <span class="text-sm font-medium max-w-[60%] text-right">{{
                data.product.description
              }}</span>
            </div>
            } @if (data.product.interestRate) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Taux d'intérêt</span>
              <span class="text-sm font-medium"
                >{{ data.product.interestRate }}%</span
              >
            </div>
            } @if (data.product.duration) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Durée</span>
              <span class="text-sm font-medium"
                >{{ data.product.duration }} mois</span
              >
            </div>
            } @if (data.product.insuranceType) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Type d'assurance</span>
              <span class="text-sm font-medium">{{
                getInsuranceTypeLabel(data.product.insuranceType)
              }}</span>
            </div>
            } @if (data.product.coverage) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Couverture</span>
              <span class="text-sm font-medium max-w-[60%] text-right">{{
                data.product.coverage
              }}</span>
            </div>
            } @if (data.product.deductible) {
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Franchise</span>
              <span class="text-sm font-medium">{{
                data.product.deductible
              }}</span>
            </div>
            }

            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Tests effectués</span>
              <span class="text-sm font-medium">{{
                data.product.testRunCount
              }}</span>
            </div>
          </div>

          @if (data.product.promotedAt) {
          <div class="border-t pt-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">
              Informations de promotion
            </h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Promu le</span>
                <span class="text-sm font-medium">{{
                  data.product.promotedAt | date : 'dd/MM/yyyy HH:mm'
                }}</span>
              </div>
              @if (data.product.promotedBy) {
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Promu par</span>
                <span class="text-sm font-medium">{{
                  data.product.promotedBy
                }}</span>
              </div>
              }
            </div>
          </div>
          }
        </div>
      </tas-drawer-content>

      <tas-drawer-action>
        <button tas-outlined-button closable-drawer>
          <tas-icon iconName="close"></tas-icon>
          Fermer
        </button>
        @if (data.product.environment === 'sandbox') {
        <button tas-raised-button color="primary" (click)="promote()">
          <tas-icon iconName="feather:arrow-up-circle"></tas-icon>
          Promouvoir en production
        </button>
        } @else {
        <button tas-outlined-button (click)="demote()">
          <tas-icon iconName="feather:arrow-down-circle"></tas-icon>
          Rétrograder en sandbox
        </button>
        }
      </tas-drawer-action>
    </tas-side-drawer>
  `,
})
export class ProductDetailDialogComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: ProductDetailDialogData = inject(DIALOG_DATA);
  private readonly _http = inject(HttpClient);

  public getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      active: 'Actif',
      deprecated: 'Déprécié',
    };
    return labels[status] || status;
  }

  public getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      loan: 'Prêt',
      savings: 'Épargne',
      insurance: 'Assurance',
    };
    return labels[type] || type;
  }

  public getInsuranceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      life: 'Vie',
      health: 'Santé',
      property: 'Biens',
    };
    return labels[type] || type;
  }

  public promote(): void {
    if (!confirm('Confirmer la promotion en production ?')) return;
    this._http
      .patch(`/api/v1/products/${this.data.product.id}/promote`, {})
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Produit promu en production');
          this._dialogRef.close(true);
        },
        error: (err: { error?: { message?: string } }) => {
          this._snackbar.error(
            'Erreur',
            err?.error?.message || 'Impossible de promouvoir le produit'
          );
        },
      });
  }

  public demote(): void {
    if (!confirm('Confirmer la rétrogradation en sandbox ?')) return;
    this._http
      .patch(`/api/v1/products/${this.data.product.id}/demote`, {})
      .subscribe({
        next: () => {
          this._snackbar.success('Succès', 'Produit rétrogradé en sandbox');
          this._dialogRef.close(true);
        },
        error: () => {
          this._snackbar.error(
            'Erreur',
            'Impossible de rétrograder le produit'
          );
        },
      });
  }
}
