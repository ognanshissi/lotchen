import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ContentChild,
  contentChildren,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { TableColumn, TableConfig } from './table-types';
import { TableDataSource } from './table-datasource';
import { TableEntity } from './table-entity';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { RowSelectionMaster } from './row-selection-master';
import { RowSelectionItem } from './row-selection-item';
import { TasSpinner } from '@talisoft/ui/spinner';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasIcon } from '@talisoft/ui/icon';
import { TasInput } from '@talisoft/ui/input';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';

@Component({
  selector: 'tas-table',
  standalone: true,
  templateUrl: `./table.html`,
  styleUrl: './table.scss',
  imports: [
    NgIf,
    NgTemplateOutlet,
    TasSpinner,
    ButtonModule,
    FormField,
    TasIcon,
    TasInput,
    TasTitle,
    TasText,
    TasLabel,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasTable<T extends TableEntity>
  implements OnInit, OnChanges, AfterViewInit
{
  public data = input.required<T[]>();
  public identifierField = input<string>('id');
  public config = input<TableConfig>();
  public columns = input<TableColumn[]>([]);
  public isLoading = input<boolean>(false);

  public title = input<string>();

  public selectionItems = output<T[]>();

  public paginator = viewChild<MatPaginator>(MatPaginator);
  public sort = viewChild<MatSort>(MatSort);

  public table = viewChild<MatTable<T>>(MatTable<T>);
  public pageEvent = output<PageEvent>();

  public selection: SelectionModel<T> = new SelectionModel<T>(
    true,
    [],
    true,
    (o1, o2) => o1[this.identifierField()] === o2[this.identifierField()]
  );

  public refresh = output();

  public rowSelectionMaster = contentChild<RowSelectionMaster>(
    RowSelectionMaster,
    {
      descendants: true,
    }
  );

  public rowSelectionItems = contentChildren(RowSelectionItem, {
    descendants: true,
  });

  // ContentChild
  @ContentChild('header') header!: TemplateRef<any>;
  @ContentChild('body') body!: TemplateRef<any>;
  @ContentChild('caption') caption!: TemplateRef<any>;

  public dataSource!: TableDataSource<T>;

  public ngAfterViewInit() {
    // Whenever the selection change emit selectionItems event
    this.selection.changed.subscribe(() => {
      this.selectionItems.emit(this.selection.selected);
    });

    // Master selection
    if (this.rowSelectionMaster() && this.rowSelectionItems()) {
      this._handleMasterSelection();
      this._handleItemSelection();
    }
  }

  private _handleMasterSelection(): void {
    this.rowSelectionMaster()?.valueChange.subscribe((res) => {
      // Check all checkboxes
      this.rowSelectionItems()?.forEach((rowItem) => {
        rowItem.toggle();
      });
      // Select all
      if (res) {
        this.selection.select(...this.data());
      } else {
        this.selection.clear();
      }
    });
  }

  private _handleItemSelection(): void {
    this.rowSelectionItems().map((item: RowSelectionItem, index: number) => {
      const currentItem = this.data().find((el, i) => i === index);
      if (currentItem) {
        item.valueChange.subscribe(() => {
          this.selection.toggle(currentItem);
          this.rowSelectionMaster()?.isChecked.set(
            this.selection.selected.length === this.data().length
          );
        });
      }
    });
  }

  public ngOnInit(): void {
    this.dataSource = new TableDataSource<T>(this.data() ?? [], this.columns());
  }

  public ngOnChanges(changes: SimpleChanges) {
    // this._updateDatasource();
  }

  public isMasterSelected(): boolean {
    if (!this.data()?.length) return false;
    return this.data()?.length === this.selection.selected.length;
  }

  // private _updateDatasource() {
  //   if (this.config()?.pagination?.serverSide) {
  //     this.table()?.dataSource = [...this.data()];
  //     this.paginator().length =
  //       this.config().pagination.totalElements ?? this.data.length;
  //   }
  //
  //   this.paginator().pageIndex = this.config()?.pagination.pageIndex;
  //   this.paginator().pageSizeOptions =
  //     this.config()?.pagination.pageSizeOptions;
  //   this.paginator().pageSize = this.config()?.pagination.pageSize;
  //
  //   this.dataSource.sort = this.sort();
  //   if (!this.config()?.pagination.serverSide) {
  //     this.paginator().length = this.data.length;
  //     this.table().dataSource = this.dataSource;
  //   }
  //   this.dataSource.paginator = this.paginator();
  // }
}
