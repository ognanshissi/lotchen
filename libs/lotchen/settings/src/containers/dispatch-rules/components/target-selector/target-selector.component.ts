import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TasIcon } from '@talisoft/ui/icon';
import { ButtonModule } from '@talisoft/ui/button';
import { Severity, TasTag } from '@talisoft/ui/tag';
import { TasSpinner } from '@talisoft/ui/spinner';

export interface EligibleTarget {
  id: string;
  type: 'agent' | 'team' | 'queue' | 'department';
  label: string;
  subLabel?: string;
}

export interface AssignmentTargetValue {
  targetId: string;
  type: string;
  label: string;
  isFallback: boolean;
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dispatch-target-selector',
  templateUrl: './target-selector.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TasIcon,
    ButtonModule,
    TasTag,
    TasSpinner,
  ],
})
export class TargetSelectorComponent implements OnInit {
  private readonly _http = inject(HttpClient);

  public targets = input<AssignmentTargetValue[]>([]);
  public targetsChange = output<AssignmentTargetValue[]>();

  public eligibleTargets = signal<EligibleTarget[]>([]);
  public isLoading = signal(false);
  public searchQuery = signal('');
  public activeTypeFilter = signal<string>('all');

  public readonly typeFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'agent', label: 'Agents' },
    { value: 'team', label: 'Équipes' },
  ];

  public filteredTargets = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const type = this.activeTypeFilter();
    return this.eligibleTargets().filter((t) => {
      const matchesType = type === 'all' || t.type === type;
      const matchesSearch =
        !q ||
        t.label.toLowerCase().includes(q) ||
        (t.subLabel ?? '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  });

  public selectedIds = computed(
    () => new Set(this.targets().map((t) => t.targetId))
  );

  public ngOnInit(): void {
    this.loadTargets();
  }

  private loadTargets(): void {
    this.isLoading.set(true);
    this._http
      .get<EligibleTarget[]>('/api/v1/dispatch-rules/eligible-targets')
      .subscribe({
        next: (data) => {
          this.eligibleTargets.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  public isSelected(target: EligibleTarget): boolean {
    return this.selectedIds().has(target.id);
  }

  public isFallback(target: EligibleTarget): boolean {
    return this.targets().some((t) => t.targetId === target.id && t.isFallback);
  }

  public toggleTarget(target: EligibleTarget): void {
    const current = this.targets();
    if (this.isSelected(target)) {
      this.targetsChange.emit(current.filter((t) => t.targetId !== target.id));
    } else {
      this.targetsChange.emit([
        ...current,
        {
          targetId: target.id,
          type: target.type,
          label: target.label,
          isFallback: false,
        },
      ]);
    }
  }

  public toggleFallback(target: EligibleTarget): void {
    const current = this.targets().map((t) =>
      t.targetId === target.id ? { ...t, isFallback: !t.isFallback } : t
    );
    this.targetsChange.emit(current);
  }

  public getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      agent: 'Agent',
      team: 'Équipe',
      queue: 'File',
      department: 'Département',
    };
    return labels[type] ?? type;
  }

  public getTypeColor(type: string): Severity {
    return type === 'agent'
      ? 'primary'
      : type === 'team'
      ? 'accent'
      : 'neutral';
  }
}
