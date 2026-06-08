import type { ChartConfiguration, ChartData } from 'chart.js';
import type { Item } from '@shared/models';

export const categoryColors = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
  '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'
];

export const categoryChartOptions: ChartConfiguration<'doughnut'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: ctx => {
          const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const value = ctx.parsed as number;
          const pct = ((value / total) * 100).toFixed(1);
          return ` ${ctx.label}: ${value} items (${pct}%)`;
        }
      }
    }
  }
};

export const yearChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.parsed.y} items`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1 }
    }
  }
};

export function buildCategoryChartData(
  items: Item[],
  catMap: Map<string, string>
): ChartData<'doughnut'> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return {
    labels: sorted.map(([id]) => catMap.get(id) ?? id),
    datasets: [{
      data: sorted.map(([, count]) => count),
      backgroundColor: sorted.map((_, i) => categoryColors[i % categoryColors.length]),
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8
    }]
  };
}

export function buildYearChartData(items: Item[]): ChartData<'bar'> {
  const counts = new Map<number, number>();
  for (const item of items) {
    counts.set(item.year, (counts.get(item.year) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => a[0] - b[0]);

  return {
    labels: sorted.map(([year]) => String(year)),
    datasets: [{
      data: sorted.map(([, count]) => count),
      backgroundColor: '#3b82f6',
      borderWidth: 0,
      borderRadius: 4
    }]
  };
}
