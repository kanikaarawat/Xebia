'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAllUnavailabilityData, 
  checkUnavailabilityDataIntegrity,
  getUnavailabilityStats,
  type UnavailabilityRecord
} from '@/lib/checkUnavailabilityData';

type Summary = {
  totalRecords: number;
  uniqueTherapists: number;
  withAppointments: number;
  withoutAppointments: number;
  orphanedRecords: number;
  missingUnavailability: number;
};

type Integrity = {
  orphanedRecords: { count: number; ids: string[] };
  missingUnavailability: { count: number; ids: string[] };
};

type Stats = {
  totalRecords: number;
  uniqueTherapists: number;
  averageDuration: number;
  reasons: Array<Record<string, unknown>>;
};

export default function UnavailabilityDataViewer() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fullData, integrity, stats] = await Promise.all([
        getAllUnavailabilityData(),
        checkUnavailabilityDataIntegrity(),
        getUnavailabilityStats()
      ]);
      
      setData({
        ...fullData,
        integrity,
        stats
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading unavailability data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">Error: {error}</div>
            <Button onClick={fetchData} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">No data available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Unavailability Data Viewer</h1>
        <Button onClick={fetchData}>Refresh Data</Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="records">All Records</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.summary as Summary).totalRecords}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique Therapists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.summary as Summary).uniqueTherapists}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">With Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.summary as Summary).withAppointments}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Without Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.summary as Summary).withoutAppointments}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Orphaned Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{(data.summary as Summary).orphanedRecords}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Missing Unavailability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{(data.summary as Summary).missingUnavailability}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>By Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(data.byReason as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => (
                    <div key={item.reason as string} className="flex justify-between items-center">
                      <span className="text-sm">{item.reason as string}</span>
                      <Badge variant="secondary">{item.count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Therapist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(data.byTherapist as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => (
                    <div key={item.therapist_name as string} className="flex justify-between items-center">
                      <span className="text-sm">{item.therapist_name as string}</span>
                      <Badge variant="secondary">{item.count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Unavailability Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(data.records as UnavailabilityRecord[]).map((record: UnavailabilityRecord) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{record.therapist_name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(record.start_time).toLocaleString()} - {new Date(record.end_time).toLocaleString()}
                        </div>
                        <div className="text-sm">{record.reason}</div>
                      </div>
                      <div className="text-right">
                        {record.appointment_id && (
                          <Badge variant="outline">Has Appointment</Badge>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Unavailability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.todayUnavailability as UnavailabilityRecord[]).length === 0 ? (
                  <div className="text-center text-gray-500">No unavailability records for today</div>
                ) : (
                  (data.todayUnavailability as UnavailabilityRecord[]).map((record: UnavailabilityRecord) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{record.therapist_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(record.start_time).toLocaleTimeString()} - {new Date(record.end_time).toLocaleTimeString()}
                          </div>
                          <div className="text-sm">{record.reason}</div>
                        </div>
                        {record.appointment_id && (
                          <Badge variant="outline">Appointment</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Integrity Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span>Orphaned Records</span>
                      <Badge variant={(data.integrity as Integrity).orphanedRecords.count > 0 ? "destructive" : "secondary"}>
                        {(data.integrity as Integrity).orphanedRecords.count}
                      </Badge>
                    </div>
                    {(data.integrity as Integrity).orphanedRecords.count > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        IDs: {(data.integrity as Integrity).orphanedRecords.ids.slice(0, 5).join(', ')}
                        {(data.integrity as Integrity).orphanedRecords.ids.length > 5 && '...'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <span>Missing Unavailability</span>
                      <Badge variant={(data.integrity as Integrity).missingUnavailability.count > 0 ? "destructive" : "secondary"}>
                        {(data.integrity as Integrity).missingUnavailability.count}
                      </Badge>
                    </div>
                    {(data.integrity as Integrity).missingUnavailability.count > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        IDs: {(data.integrity as Integrity).missingUnavailability.ids.slice(0, 5).join(', ')}
                        {(data.integrity as Integrity).missingUnavailability.ids.length > 5 && '...'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week&apos;s Unavailability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(data.thisWeekUnavailability as UnavailabilityRecord[]).length === 0 ? (
                    <div className="text-center text-gray-500">No unavailability this week</div>
                  ) : (
                    (data.thisWeekUnavailability as UnavailabilityRecord[]).map((record: UnavailabilityRecord) => (
                      <div key={record.id} className="text-sm">
                        <div className="font-medium">{record.therapist_name}</div>
                        <div className="text-gray-600">
                          {new Date(record.start_time).toLocaleDateString()} - {record.reason}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Total Records</div>
                    <div className="text-2xl font-bold">{(data.stats as Stats).totalRecords}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Unique Therapists</div>
                    <div className="text-2xl font-bold">{(data.stats as Stats).uniqueTherapists}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Average Duration (minutes)</div>
                    <div className="text-2xl font-bold">{Math.round((data.stats as Stats).averageDuration)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reasons Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {((data.stats as Stats).reasons as Array<Record<string, unknown>>).map((item: Record<string, unknown>) => (
                    <div key={item.reason as string} className="flex justify-between items-center">
                      <span className="text-sm">{item.reason as string}</span>
                      <Badge variant="secondary">{item.count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 