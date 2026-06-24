import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TasTitle } from '@talisoft/ui/title';
import { TasText } from '@talisoft/ui/text';
import { TasCard } from '@talisoft/ui/card';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { FormField, TasLabel } from '@talisoft/ui/form-field';
import { TasSelect } from '@talisoft/ui/select';
import { TasSpinner } from '@talisoft/ui/spinner';
import { SnackbarService } from '@talisoft/ui/snackbar';
import {
  ConditionBuilderComponent,
  DispatchConditionGroup,
} from '../components/condition-builder/condition-builder.component';
import {
  TargetSelectorComponent,
  AssignmentTargetValue,
} from '../components/target-selector/target-selector.component';
import {
  RoutingStrategyFormComponent,
  RoutingStrategyValue,
} from '../components/routing-strategy-form/routing-strategy-form.component';
import {
  CapacityFormComponent,
  CapacityRulesValue,
} from '../components/capacity-form/capacity-form.component';
import {
  AvailabilityFormComponent,
  AvailabilityConfigValue,
} from '../components/availability-form/availability-form.component';
import {
  EscalationFormComponent,
  EscalationRuleValue,
} from '../components/escalation-form/escalation-form.component';
import { TasTag } from '@talisoft/ui/tag';
import { ConfirmDialogService } from '@talisoft/ui/confirm-dialog';

type Tab =
  | 'general'
  | 'conditions'
  | 'targets'
  | 'routing'
  | 'capacity'
  | 'availability'
  | 'escalation'
  | 'audit'
  | 'versions';

interface AuditLog {
  _id: string;
  objectType: string;
  objectId?: string;
  matchedConditions: string[];
  assignedTarget?: { type: string; targetId: string };
  triggeredBy: string;
  createdAt: string;
}

interface RuleVersion {
  version: number;
  name: string;
  status: string;
  objectType: string;
  snapshotAt: string;
}

@Component({
  selector: 'settings-rule-edit',
  templateUrl: './rule-edit.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TasTitle,
    TasText,
    TasCard,
    TasIcon,
    ButtonModule,
    FormField,
    TasLabel,
    TasSelect,
    TasSpinner,
    TasTag,
    ConditionBuilderComponent,
    TargetSelectorComponent,
    RoutingStrategyFormComponent,
    CapacityFormComponent,
    AvailabilityFormComponent,
    EscalationFormComponent,
  ],
})
export class RuleEditComponent implements OnInit {
  private readonly _http = inject(HttpClient);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _snackbar = inject(SnackbarService);
  private readonly _confirmDialog = inject(ConfirmDialogService);

  public readonly ruleId = signal<string | null>(null);
  public readonly isLoading = signal(false);
  public readonly isSaving = signal(false);
  public readonly activeTab = signal<Tab>('general');

  public readonly isEditMode = computed(() => !!this.ruleId());
  public readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Modifier la règle' : 'Créer une règle'
  );

  // Form state
  public name = signal('');
  public description = signal('');
  public objectType = signal('');
  public status = signal('draft');
  public priority = signal(0);
  public conditions = signal<DispatchConditionGroup>({
    operator: 'AND',
    conditions: [],
  });
  public targets = signal<AssignmentTargetValue[]>([]);
  public routingStrategy = signal<RoutingStrategyValue | null>(null);
  public capacityRules = signal<CapacityRulesValue | null>(null);
  public availabilityConfig = signal<AvailabilityConfigValue | null>(null);
  public escalationRules = signal<EscalationRuleValue[]>([]);

  // Audit & Versions state
  public auditLogs = signal<AuditLog[]>([]);
  public auditTotal = signal(0);
  public auditPage = signal(1);
  public auditLoading = signal(false);
  public versions = signal<RuleVersion[]>([]);
  public versionsLoading = signal(false);

  public readonly objectTypeOptions = [
    { value: 'lead', label: 'Lead' },
    { value: 'case', label: 'Dossier' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'service_request', label: 'Demande de service' },
  ];

  public readonly statusOptions = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
  ];

  public readonly tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'Général' },
    { key: 'conditions', label: 'Conditions' },
    { key: 'targets', label: 'Cibles' },
    { key: 'routing', label: 'Stratégie' },
    { key: 'capacity', label: 'Capacité' },
    { key: 'availability', label: 'Disponibilité' },
    { key: 'escalation', label: 'Escalade' },
    { key: 'audit', label: 'Audit' },
    { key: 'versions', label: 'Versions' },
  ];

  public ngOnInit(): void {
    const id = this._route.snapshot.paramMap.get('id');
    if (id) {
      this.ruleId.set(id);
      this.loadRule(id);
    }
  }

  public loadRule(id: string): void {
    this.isLoading.set(true);
    this._http.get<any>(`/api/v1/dispatch-rules/${id}`).subscribe({
      next: (rule) => {
        this.name.set(rule.name ?? '');
        this.description.set(rule.description ?? '');
        this.objectType.set(rule.objectType ?? '');
        this.status.set(rule.status ?? 'draft');
        this.priority.set(rule.priority ?? 0);
        if (rule.conditions) this.conditions.set(rule.conditions);
        if (rule.targets?.length) {
          this.targets.set(
            rule.targets.map((t: any) => ({
              targetId: t.targetId,
              type: t.type,
              label: t.targetId,
              isFallback: t.isFallback ?? false,
            }))
          );
        }
        if (rule.routingStrategy)
          this.routingStrategy.set(rule.routingStrategy);
        if (rule.capacityRules) this.capacityRules.set(rule.capacityRules);
        if (rule.availabilityConfig)
          this.availabilityConfig.set(rule.availabilityConfig);
        if (rule.escalationRules?.length) {
          this.escalationRules.set(
            rule.escalationRules.map((e: any) => ({
              trigger: e.trigger ?? 'sla_breach',
              delayMinutes: e.delayMinutes ?? 60,
              targetId: e.targetId ?? '',
              targetLabel: e.targetId ?? '',
              notifyOnEscalation: e.notifyOnEscalation ?? false,
            }))
          );
        }
        this.isLoading.set(false);
      },
      error: () => {
        this._snackbar.error('Erreur', 'Impossible de charger la règle');
        this.isLoading.set(false);
      },
    });
  }

  public setTab(tab: Tab): void {
    this.activeTab.set(tab);
    const id = this.ruleId();
    if (id && tab === 'audit' && this.auditLogs().length === 0) {
      this.loadAuditLogs(id, 1);
    }
    if (id && tab === 'versions' && this.versions().length === 0) {
      this.loadVersions(id);
    }
  }

  public loadAuditLogs(id: string, page: number): void {
    this.auditLoading.set(true);
    this.auditPage.set(page);
    this._http
      .get<{ total: number; page: number; limit: number; data: AuditLog[] }>(
        `/api/v1/dispatch-rules/${id}/audit`,
        { params: { page: String(page), limit: '20' } }
      )
      .subscribe({
        next: (res) => {
          this.auditLogs.set(res.data);
          this.auditTotal.set(res.total);
          this.auditLoading.set(false);
        },
        error: () => this.auditLoading.set(false),
      });
  }

  public loadVersions(id: string): void {
    this.versionsLoading.set(true);
    this._http
      .get<RuleVersion[]>(`/api/v1/dispatch-rules/${id}/versions`)
      .subscribe({
        next: (data) => {
          this.versions.set(data);
          this.versionsLoading.set(false);
        },
        error: () => this.versionsLoading.set(false),
      });
  }

  public restoreVersion(version: number): void {
    const id = this.ruleId();
    if (!id) return;
    // this._confirmDialog
    //   .confirm({
    //     title: `Restaurer la version ${version}`,
    //     message:
    //       'La version actuelle sera archivée et la version sélectionnée sera restaurée en brouillon. Continuer ?',
    //     confirmLabel: 'Restaurer',
    //     cancelLabel: 'Annuler',
    //   })
    //   .subscribe((confirmed) => {
    //     if (!confirmed) return;
    //     this._http
    //       .post(`/api/v1/dispatch-rules/${id}/versions/${version}/restore`, {})
    //       .subscribe({
    //         next: () => {
    //           this._snackbar.success('Succès', `Version ${version} restaurée`);
    //           this.loadRule(id);
    //           this.versions.set([]);
    //           this.loadVersions(id);
    //         },
    //         error: () =>
    //           this._snackbar.error('Erreur', 'Impossible de restaurer la version'),
    //       });
    //   });
  }

  public getBadge(tab: Tab): number | null {
    if (tab === 'targets') return this.targets().length || null;
    if (tab === 'escalation') return this.escalationRules().length || null;
    return null;
  }

  public onConditionsChange(group: DispatchConditionGroup): void {
    this.conditions.set(group);
  }

  public onTargetsChange(targets: AssignmentTargetValue[]): void {
    this.targets.set(targets);
  }

  public onRoutingStrategyChange(strategy: RoutingStrategyValue): void {
    this.routingStrategy.set(strategy);
  }

  public onCapacityChange(capacity: CapacityRulesValue): void {
    this.capacityRules.set(capacity);
  }

  public onAvailabilityChange(availability: AvailabilityConfigValue): void {
    this.availabilityConfig.set(availability);
  }

  public onEscalationRulesChange(rules: EscalationRuleValue[]): void {
    this.escalationRules.set(rules);
  }

  public save(): void {
    if (!this.name().trim()) {
      this._snackbar.error('Erreur', 'Le nom est obligatoire');
      return;
    }
    if (!this.objectType()) {
      this._snackbar.error('Erreur', "Le type d'objet est obligatoire");
      return;
    }

    const payload = {
      name: this.name(),
      description: this.description(),
      objectType: this.objectType(),
      status: this.status(),
      priority: this.priority(),
      conditions: this.conditions(),
      targets: this.targets().map((t) => ({
        targetId: t.targetId,
        type: t.type,
        isFallback: t.isFallback,
      })),
      routingStrategy: this.routingStrategy(),
      capacityRules: this.capacityRules(),
      availabilityConfig: this.availabilityConfig(),
      escalationRules: this.escalationRules().map((e) => ({
        trigger: e.trigger,
        delayMinutes: e.delayMinutes,
        targetId: e.targetId || undefined,
        notifyOnEscalation: e.notifyOnEscalation,
      })),
    };

    this.isSaving.set(true);

    const id = this.ruleId();
    const request$ = id
      ? this._http.patch(`/api/v1/dispatch-rules/${id}`, payload)
      : this._http.post('/api/v1/dispatch-rules', payload);

    request$.subscribe({
      next: (result: any) => {
        this._snackbar.success('Succès', 'Règle sauvegardée');
        this.isSaving.set(false);
        if (!id && result?._id) {
          this._router.navigate(['..', result._id, 'edit'], {
            relativeTo: this._route,
          });
        }
      },
      error: () => {
        this._snackbar.error('Erreur', 'Impossible de sauvegarder la règle');
        this.isSaving.set(false);
      },
    });
  }
}

export default RuleEditComponent;
