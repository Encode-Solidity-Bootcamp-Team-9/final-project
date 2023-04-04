import { EChartsOption } from 'echarts';

export interface PieData {
  value: number;
  name: string;
}

export function generatePieOptions(
  data: PieData[],
  symbols: string[]
): EChartsOption {
  const colors = ['#4fc2dd', '#a465aa'];
  const chartOptions: EChartsOption = {
    series: [
      {
        name: 'Total Profits',
        type: 'pie',
        radius: ['55%', '80%'],
        label: {
          show: true,
        },
        labelLine: {
          show: true,
        },
        data: data.map((d, idx) => {
          return {
            value: d.value,
            name: d.name,
            itemStyle: {
              color: colors[idx],
            },
            label: { color: colors[idx] },
          };
        }),
        itemStyle: {
          borderWidth: 5,
          borderColor: '#112240',
        },
      },
      {
        name: '',
        type: 'pie',
        radius: ['55%', '80%'],
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: data.map((d, idx) => {
          return {
            value: d.value,
            name: `${d.value} ${symbols[idx]}`,
            itemStyle: {
              color: colors[idx],
            },
            label: { color: colors[idx] },
          };
        }),
        itemStyle: {
          borderWidth: 5,
          borderColor: '#112240',
        },
      },
    ],
  };

  return chartOptions;
}
