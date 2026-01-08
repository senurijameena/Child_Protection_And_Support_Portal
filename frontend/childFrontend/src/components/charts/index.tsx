import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


interface BaseChartProps {
  height?: number;
  title?: string;
}

interface XYChartProps extends BaseChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

interface PieChartProps extends BaseChartProps {
  data: any[];
  labelKey: string;
  valueKey: string;
}

interface DatasetChartProps extends BaseChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}


const COMMON_OPTIONS: any = {
  responsive: true,
  maintainAspectRatio: false,
};


export const LineChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300, 
  color = '#1a237e',
  title 
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: title || 'Value',
        data: data.map(item => item[yKey]),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        display: !!title,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};


export const BarChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300, 
  color = '#3949ab',
  title 
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: title || 'Value',
        data: data.map(item => item[yKey]),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};


export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  labelKey, 
  valueKey, 
  height = 300
}) => {
  const colors = [
    '#1a237e', '#3949ab', '#5c6bc0', '#7986cb',
    '#283593', '#303f9f', '#3f51b5',
    '#ff9800', '#ff5722', '#e91e63', '#9c27b0',
    '#009688', '#4caf50', '#8bc34a'
  ];

  const chartData = {
    labels: data.map(item => item[labelKey]),
    datasets: [
      {
        data: data.map(item => item[valueKey]),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export const DoughnutChart: React.FC<PieChartProps> = ({
  data,
  labelKey,
  valueKey,
  height = 300
}) => {
  const colors = [
    '#1a237e', '#3949ab', '#5c6bc0', '#7986cb',
    '#283593', '#303f9f', '#3f51b5'
  ];

  const chartData = {
    labels: data.map(item => item[labelKey]),
    datasets: [
      {
        data: data.map(item => item[valueKey]),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};


export const StackedBarChart: React.FC<DatasetChartProps> = ({
  labels,
  datasets,
  height = 300
}) => {
  const colors = ['#1a237e', '#3949ab', '#5c6bc0', '#7986cb'];
  
  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1
    }))
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};


export const HorizontalBarChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300, 
  color = '#2196F3'
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: 'Value',
        data: data.map(item => item[yKey]),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        grid: {
          display: false,
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};


export const AreaChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300, 
  color = '#4CAF50'
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: 'Value',
        data: data.map(item => item[yKey]),
        borderColor: color,
        backgroundColor: `${color}40`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};


export const MultiLineChart: React.FC<DatasetChartProps> = ({
  labels,
  datasets,
  height = 300
}) => {
  const chartData = {
    labels,
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: `${dataset.color}20`,
      borderWidth: 2,
      tension: 0.4,
      fill: false,
    }))
  };

  const options: any = {
    ...COMMON_OPTIONS,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};


export const SimpleLineChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300,
  title 
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: title || 'Data',
        data: data.map(item => item[yKey]),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          }
        }}
      />
    </div>
  );
};

export const SimpleBarChart: React.FC<XYChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  height = 300,
  title 
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label: title || 'Data',
        data: data.map(item => item[yKey]),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar 
        data={chartData} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};


export const createChartConfig = (type: 'line' | 'bar' | 'pie' | 'doughnut') => {
  const baseConfig: any = {
    responsive: true,
    maintainAspectRatio: false,
  };

  switch (type) {
    case 'line':
      return {
        ...baseConfig,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      };
    case 'bar':
      return {
        ...baseConfig,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      };
    case 'pie':
      return {
        ...baseConfig,
        plugins: {
          legend: { position: 'right' }
        }
      };
    case 'doughnut':
      return {
        ...baseConfig,
        cutout: '70%',
        plugins: {
          legend: { position: 'right' }
        }
      };
    default:
      return baseConfig;
  }
};


export const generateColors = (count: number): string[] => {
  const baseColors = [
    '#1A56DB', '#2563EB', '#3B82F6', '#60A5FA',
    '#10B981', '#059669', '#34D399', '#6EE7B7',
    '#F59E0B', '#F97316', '#FB923C', '#FBBF24',
    '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
    '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE',
    '#6366F1', '#818CF8', '#A5B4FC'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
};

export const formatChartData = (
  data: any[],
  labelKey: string,
  valueKey: string
): { labels: string[], values: number[] } => {
  return {
    labels: data.map(item => item[labelKey]),
    values: data.map(item => item[valueKey])
  };
};


interface SimpleChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export const Chart = {
  Line: ({ data, height = 300, options = {} }: { data: SimpleChartData, height?: number, options?: any }) => (
    <div style={{ height: `${height}px` }}>
      <Line data={data} options={{ responsive: true, maintainAspectRatio: false, ...options }} />
    </div>
  ),
  
  Bar: ({ data, height = 300, options = {} }: { data: SimpleChartData, height?: number, options?: any }) => (
    <div style={{ height: `${height}px` }}>
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, ...options }} />
    </div>
  ),
  
  Pie: ({ data, height = 300, options = {} }: { data: SimpleChartData, height?: number, options?: any }) => (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={{ responsive: true, maintainAspectRatio: false, ...options }} />
    </div>
  ),
  
  Doughnut: ({ data, height = 300, options = {} }: { data: SimpleChartData, height?: number, options?: any }) => (
    <div style={{ height: `${height}px` }}>
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, ...options }} />
    </div>
  )
};


const Charts = {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
  StackedBarChart,
  HorizontalBarChart,
  AreaChart,
  MultiLineChart,
  SimpleLineChart,
  SimpleBarChart,
  Chart,
  createChartConfig,
  generateColors,
  formatChartData
};

export default Charts;