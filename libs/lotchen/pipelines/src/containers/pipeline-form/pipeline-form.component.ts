import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { SalesPipelinesApiService } from '@talisoft/api/lotchen-client-api';
import { SnackbarService } from '@talisoft/ui/snackbar';
import { TasCard, TasCardHeader } from '@talisoft/ui/card';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';
import { TasSpinner } from '@talisoft/ui/spinner';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasInput } from '@talisoft/ui/input';

@Component({
  selector: 'pipeline-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pipeline-form.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    TasCard,
    TasCardHeader,
    TasTitle,
    TasText,
    ButtonModule,
    TasIcon,
    TasSpinner,
    FormField,
    TasLabel,
    TasInput,
  ],
})
export class PipelineFormComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _pipelinesApi = inject(SalesPipelinesApiService);
  private readonly _snackbar = inject(SnackbarService);

  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  pipelineId = signal<string | null>(null);

  // FormGroup definition
  public form = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    currency: new FormControl('XOF'),
    stages: this._fb.array([]),
  });

  get stagesArray(): FormArray {
    return this.form.controls['stages'] as FormArray;
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  public ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.pipelineId.set(id);
      this.loadPipeline(id);
    } else {
      this.addDefaultStages();
    }
  }

  loadPipeline(id: string): void {
    this.isLoading.set(true);
    this._pipelinesApi.salesPipelinesControllerFindByIdV1(id).subscribe({
      next: (pipeline) => {
        this.form.patchValue({
          name: pipeline.name,
          description: pipeline.description,
          currency: pipeline.currency,
        });
        this.stagesArray.clear();
        for (const stage of pipeline.stages || []) {
          this.stagesArray.push(
            this._createStageForm(stage as any, this.stagesArray.length)
          );
        }
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error('Erreur', 'Pipeline introuvable');
        this._router.navigate(['/portal/pipelines']);
      },
    });
  }

  addDefaultStages(): void {
    const defaults = [
      { name: 'Prospect', color: '#6366f1', winProbability: 10 },
      { name: 'Qualification', color: '#8b5cf6', winProbability: 25 },
      { name: 'Proposition', color: '#a855f7', winProbability: 50 },
      { name: 'Négociation', color: '#d946ef', winProbability: 75 },
      {
        name: 'Clôture',
        color: '#22c55e',
        winProbability: 100,
        isWon: true,
      },
      { name: 'Perdu', color: '#ef4444', winProbability: 0, isLost: true },
    ];
    for (const [index, stage] of defaults.entries()) {
      this.stagesArray.push(this._createStageForm(stage as any, index));
    }
  }

  private _createStageForm(
    stageData: {
      name: string;
      color: string;
      winProbability: number;
      isWon: boolean;
      order: number;
      isLost: boolean;
    } | null,
    index: number
  ): FormGroup {
    return new FormGroup({
      stageId: new FormControl(''),
      name: new FormControl(stageData?.name ?? '', Validators.required),
      order: new FormControl(stageData?.order ?? index),
      color: new FormControl(stageData?.color ?? '#6366f1'),
      winProbability: new FormControl(stageData?.winProbability ?? 0),
      isWon: new FormControl(stageData?.isWon || false),
      isLost: new FormControl(stageData?.isLost || false),
    });
  }

  addStage(): void {
    this.stagesArray.push(this._createStageForm(null, this.stagesArray.length));
  }

  removeStage(index: number): void {
    this.stagesArray.removeAt(index);
    this.reorderStages();
  }

  dropStage(event: CdkDragDrop<any>): void {
    moveItemInArray(
      this.stagesArray.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.reorderStages();
  }

  private reorderStages(): void {
    this.stagesArray.controls.forEach((ctrl, i) => {
      ctrl.get('order')?.setValue(i);
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      name: value.name!,
      description: value.description || '',
      currency: value.currency || 'XOF',
      stages: value.stages.map((s: any, i: number) => ({
        stageId: s.stageId || undefined,
        name: s.name,
        order: i,
        color: s.color,
        winProbability: s.winProbability,
        isWon: s.isWon,
        isLost: s.isLost,
      })),
    };

    const request$ = this.isEditMode()
      ? this._pipelinesApi.salesPipelinesControllerUpdateV1(
          this.pipelineId()!,
          payload
        )
      : this._pipelinesApi.salesPipelinesControllerCreateV1(payload);

    request$.subscribe({
      next: () => {
        this._snackbar.success(
          'Succès',
          this.isEditMode() ? 'Pipeline mis à jour' : 'Pipeline créé'
        );
        this._router.navigate(['/portal/pipelines']);
      },
      error: (err) => {
        this._snackbar.error(
          'Erreur',
          err?.error?.message || 'Erreur lors de la sauvegarde'
        );
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    this._router.navigate(['/portal/pipelines']);
  }
}

export default PipelineFormComponent;
