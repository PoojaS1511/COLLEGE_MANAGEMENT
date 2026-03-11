import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'primary',
  prefix = '',
  suffix = ''
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 10000000) {
        return `${(val / 10000000).toFixed(2)}Cr`;
      } else if (val >= 100000) {
        return `${(val / 100000).toFixed(2)}L`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(2)}K`;
      }
      return val.toLocaleString('en-IN');
    }
    return val;
  };

  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#6b7280';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  const colorMap = {
    primary: '#16a34a',
    secondary: '#3b82f6',
    error: '#dc2626',
    warning: '#f59e0b',
    info: '#06b6d4',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 h-full">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600">
              {title}
            </p>
            <p className="text-2xl font-bold mt-2" style={{ color: colorMap[color] }}>
              {prefix}{formatValue(value)}{suffix}
            </p>
          </div>
          {Icon && (
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${colorMap[color]}15`,
                color: colorMap[color]
              }}
            >
              <Icon size={24} />
            </div>
          )}
        </div>
        
        {trendValue !== undefined && (
          <div className="flex items-center space-x-2">
            {TrendIcon && (
              <TrendIcon 
                size={16} 
                style={{ color: trendColor }}
              />
            )}
            <p 
              className="text-sm font-medium"
              style={{ color: trendColor }}
            >
              {Math.abs(trendValue)}%
            </p>
            <p className="text-sm text-gray-500">
              vs last month
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;