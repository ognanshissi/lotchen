import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasTitle } from '@talisoft/ui/title';
import { AgenciesApiService } from '@talisoft/api/lotchen-client-api';
import { TasIcon } from '@talisoft/ui/icon';
import { Chart } from 'chart.js/auto';
import { TasCard } from '@talisoft/ui/card';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [ButtonModule, TasTitle, TasIcon, TasCard],
})
export class HomeComponent implements OnInit, AfterViewInit {
  private readonly _agenciesApiService = inject(AgenciesApiService);

  public ngOnInit() {
    this._agenciesApiService
      .agenciesControllerFindAllAgenciesV1()
      .subscribe((agencies) => console.log(agencies));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createLoanChart();
      this.createPortfolioChart();
    }, 0);
  }

  private createLoanChart() {
    const ctx = document.getElementById('loanChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [
          {
            label: 'Décaissements',
            data: [300000, 450000, 600000, 475000, 550000, 650000],
            borderColor: '#3182ce',
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Remboursements',
            data: [250000, 400000, 550000, 450000, 500000, 600000],
            borderColor: '#48bb78',
            tension: 0.4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString() + ' FCFA',
            },
          },
        },
      },
    });
  }

  private createPortfolioChart() {
    const ctx = document.getElementById('portfolioChart') as HTMLCanvasElement;
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Commerce',
          'Agriculture',
          'Services',
          'Artisanat',
          'Transport',
        ],
        datasets: [
          {
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              '#3182ce',
              '#48bb78',
              '#805ad5',
              '#d69e2e',
              '#e53e3e',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
  }
}
