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
import { SnackbarService } from '@talisoft/ui/snackbar';
import { ProductResponse } from '../../containers/products/products.interfaces';
import { ProductsApiService } from '@talisoft/api/lotchen-client-api';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';

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
  templateUrl: './product-detail-dialog.component.html',
})
export class ProductDetailDialogComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _snackbar = inject(SnackbarService);
  public readonly data: ProductDetailDialogData = inject(DIALOG_DATA);
  private readonly _productsApiService = inject(ProductsApiService);
  private readonly _confirmDialogService = inject(ConfirmDialogService);

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
    this._confirmDialogService.confirm({
      title: 'Confirmer la promotion en production ?',
      message: '',
      closable: true,
      acceptButtonProps: {
        label: 'Oui, promouvoir',
        theme: 'primary',
        icon: 'feather:arrow-up-circle',
      },
      accept: () => {
        this._productsApiService
          .productControllerPromoteV1(this.data.product.id)
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
      },
    });
  }

  public demote(): void {
    this._confirmDialogService.confirm({
      title: 'Confirmer la rétrogradation en sandbox ?',
      message: '',
      closable: true,
      accept: () => {
        this._productsApiService
          .productControllerDemoteV1(this.data.product.id)
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
      },
    });
  }
}
