import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PowerCycleBarreStrengthMetricCards } from './PowerCycleBarreStrengthMetricCards';
import { PowerCycleBarreStrengthComparison } from './PowerCycleBarreStrengthComparison';
import { PowerCycleBarreStrengthCharts } from './PowerCycleBarreStrengthCharts';
import { PowerCycleBarreStrengthDataTables } from './PowerCycleBarreStrengthDataTables';
import { PowerCycleBarreStrengthFilterSection } from './PowerCycleBarreStrengthFilterSection';
import { DrillDownModal } from './DrillDownModal';
import { SourceDataModal } from '@/components/ui/SourceDataModal';
import { usePayrollData } from '@/hooks/usePayrollData';
import { RefinedLoader } from '@/components/ui/RefinedLoader';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { TrendingUp, BarChart3, Activity, Users, Eye, Zap } from 'lucide-react';

export const PowerCycleVsBarreSection: React.FC = () => {
  const { setLoading } = useGlobalLoading();
  const { data: payrollData, isLoading: loading, error } = usePayrollData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [showSourceData, setShowSourceData] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState('all');

  React.useEffect(() => {
    setLoading(loading, 'Loading PowerCycle vs Barre vs Strength comparison data...');
  }, [loading, setLoading]);

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    if (!payrollData) return [];
    
    let filtered = payrollData;
    
    // Apply location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    // Apply trainer filter
    if (selectedTrainer !== 'all') {
      filtered = filtered.filter(item => item.teacherName === selectedTrainer);
    }
    
    // Apply timeframe filter
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedTimeframe) {
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(item => {
        if (!item.monthYear) return false;
        const [monthName, year] = item.monthYear.split(' ');
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
        const itemDate = new Date(parseInt(year), monthIndex, 1);
        return itemDate >= startDate && itemDate <= now;
      });
    }
    
    return filtered;
  }, [payrollData, selectedLocation, selectedTimeframe, selectedTrainer]);

  const handleItemClick = (item: any) => {
    setDrillDownData(item);
  };

  if (loading) {
    return <RefinedLoader subtitle="Loading PowerCycle vs Barre analysis..." />;
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <PowerCycleBarreStrengthFilterSection 
        data={payrollData || []}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedTrainer={selectedTrainer}
        onTrainerChange={setSelectedTrainer}
      />

      {/* Metric Cards */}
      <PowerCycleBarreStrengthMetricCards data={filteredData} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparison
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="tables" className="text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Data Tables
              </TabsTrigger>
              <TabsTrigger value="trainers" className="text-sm font-medium">
                <Eye className="w-4 h-4 mr-2" />
                Trainer Analysis
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="overview" className="space-y-8">
          <PowerCycleBarreStrengthComparison data={filteredData} onItemClick={handleItemClick} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-8">
          <PowerCycleBarreStrengthCharts data={filteredData} />
        </TabsContent>

        <TabsContent value="tables" className="space-y-8">
          <PowerCycleBarreStrengthDataTables data={filteredData} onItemClick={handleItemClick} />
        </TabsContent>

        <TabsContent value="trainers" className="space-y-8">
          <PowerCycleBarreStrengthDataTables data={filteredData} onItemClick={handleItemClick} viewType="trainers" />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {drillDownData && (
        <DrillDownModal
          isOpen={!!drillDownData}
          onClose={() => setDrillDownData(null)}
          data={drillDownData}
          type="trainer"
        />
      )}

      {showSourceData && (
        <SourceDataModal
          open={showSourceData}
          onOpenChange={setShowSourceData}
          sources={[
            {
              name: "PowerCycle vs Barre vs Strength Data",
              data: payrollData || []
            }
          ]}
        />
      )}
    </div>
  );
};