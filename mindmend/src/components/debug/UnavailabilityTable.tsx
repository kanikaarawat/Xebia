'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UnavailabilityRecord {
  id: string;
  therapist_id: string;
  therapist_name?: string;
  appointment_id?: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export default function UnavailabilityTable() {
  const [data, setData] = useState<UnavailabilityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'start_time' | 'therapist_name' | 'reason'>('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all unavailability records
      const { data: unavailabilityRecords, error: unavailabilityError } = await supabase
        .from("therapist_unavailability")
        .select('*')
        .order('start_time', { ascending: false });

      if (unavailabilityError) {
        console.error('❌ Error fetching unavailability records:', unavailabilityError);
        setError(unavailabilityError.message);
        return;
      }

      // Get therapist names
      const therapistIds = [...new Set(unavailabilityRecords?.map(r => r.therapist_id) || [])];
      let therapistProfiles: Record<string, unknown> = {};
      
      if (therapistIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select('id, first_name, last_name')
          .in('id', therapistIds);

        if (!profilesError && profiles) {
          therapistProfiles = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, unknown>);
        }
      }

      // Process records
      const processedRecords: UnavailabilityRecord[] = (unavailabilityRecords || []).map(record => {
        const profile = therapistProfiles[record.therapist_id];
        return {
          ...record,
          therapist_name: profile 
            ? `${(profile as { first_name?: string; last_name?: string }).first_name || ''} ${(profile as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || 'Unknown Therapist'
            : 'Unknown Therapist'
        };
      });

      setData(processedRecords);
    } catch (err) {
      console.error('❌ Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort data
  const filteredAndSortedData = data
    .filter(record => {
      if (!filter) return true;
      const searchTerm = filter.toLowerCase();
      return (
        record.therapist_name?.toLowerCase().includes(searchTerm) ||
        record.reason.toLowerCase().includes(searchTerm) ||
        record.start_time.toLowerCase().includes(searchTerm) ||
        record.end_time.toLowerCase().includes(searchTerm)
      );
    })
    .sort((a, b) => {
      let aValue: unknown, bValue: unknown;
      
      switch (sortBy) {
        case 'therapist_name':
          aValue = a.therapist_name || '';
          bValue = b.therapist_name || '';
          break;
        case 'reason':
          aValue = a.reason;
          bValue = b.reason;
          break;
        default:
          aValue = new Date(a.start_time);
          bValue = new Date(b.start_time);
      }
      
      if (sortOrder === 'asc') {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        } else {
          return String(aValue).localeCompare(String(bValue));
        }
      } else {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return bValue - aValue;
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      }
    });

  const handleSort = (field: 'start_time' | 'therapist_name' | 'reason') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Unavailability Data Table</h1>
        <Button onClick={fetchData}>Refresh Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label htmlFor="filter">Search</Label>
              <Input
                id="filter"
                placeholder="Search by therapist, reason, or time..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div>
              <Label>Sort by</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={sortBy === 'start_time' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('start_time')}
                >
                  Time {sortBy === 'start_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant={sortBy === 'therapist_name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('therapist_name')}
                >
                  Therapist {sortBy === 'therapist_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant={sortBy === 'reason' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSort('reason')}
                >
                  Reason {sortBy === 'reason' && (sortOrder === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Badge variant="secondary">
              Total Records: {data.length}
            </Badge>
            <Badge variant="secondary">
              Filtered: {filteredAndSortedData.length}
            </Badge>
            <Badge variant="secondary">
              Unique Therapists: {new Set(data.map(r => r.therapist_id)).size}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unavailability Records</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {filter ? 'No records match your search criteria' : 'No unavailability records found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Therapist</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Start Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">End Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Reason</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Appointment ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                        {record.id.slice(0, 8)}...
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {record.therapist_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(record.start_time).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(record.end_time).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Badge variant="outline">{record.reason}</Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm font-mono">
                        {record.appointment_id ? (
                          <span className="text-green-600">{record.appointment_id.slice(0, 8)}...</span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {new Date(record.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 