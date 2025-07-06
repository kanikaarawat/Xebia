"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFreeSlots } from "@/lib/freeSlots";
import { getFreeSlotsFixed, testTimeConversion } from "@/lib/freeSlotsFixed";

// Define a type for the result objects:
type Slot = { start_time: string; end_time: string; reason?: string };
type Result = { available?: Slot[]; unavailable?: Slot[]; error?: string };

export function TimeConversionTester() {
  const [therapistId, setTherapistId] = useState("test-therapist-1");
  const [selectedDate, setSelectedDate] = useState("2025-07-09");
  const [sessionDuration, setSessionDuration] = useState("30");
  const [originalResult, setOriginalResult] = useState<Result>({});
  const [fixedResult, setFixedResult] = useState<Result>({});
  const [loading, setLoading] = useState(false);
  const [timeTestResult, setTimeTestResult] = useState<string>("");

  const testOriginal = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testing original getFreeSlots...");
      const result = await getFreeSlots(therapistId, selectedDate, 30, parseInt(sessionDuration));
      setOriginalResult(result);
      console.log("✅ Original result:", result);
    } catch (error) {
      console.error("❌ Original test failed:", error);
      setOriginalResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const testFixed = async () => {
    setLoading(true);
    try {
      console.log("🧪 Testing fixed getFreeSlots...");
      const result = await getFreeSlotsFixed(therapistId, selectedDate, 30, parseInt(sessionDuration));
      setFixedResult(result);
      console.log("✅ Fixed result:", result);
    } catch (error) {
      console.error("❌ Fixed test failed:", error);
      setFixedResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const runTimeTest = () => {
    console.log("🧪 Running time conversion test...");
    testTimeConversion();
    setTimeTestResult("Check browser console for time conversion test results");
  };

  const compareResults = () => {
    if (!originalResult || !fixedResult) return null;

    const originalAvailable = Array.isArray(originalResult.available) ? originalResult.available.length : 0;
    const fixedAvailable = Array.isArray(fixedResult.available) ? fixedResult.available.length : 0;
    const originalUnavailable = Array.isArray(originalResult.unavailable) ? originalResult.unavailable.length : 0;
    const fixedUnavailable = Array.isArray(fixedResult.unavailable) ? fixedResult.unavailable.length : 0;

    return {
      availableDifference: fixedAvailable - originalAvailable,
      unavailableDifference: fixedUnavailable - originalUnavailable,
      hasDifference: originalAvailable !== fixedAvailable || originalUnavailable !== fixedUnavailable
    };
  };

  const comparison = compareResults();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Conversion Tester</CardTitle>
          <CardDescription>
            Test and compare time conversion between original and fixed versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="therapist">Therapist ID</Label>
              <Input
                id="therapist"
                value={therapistId}
                onChange={(e) => setTherapistId(e.target.value)}
                placeholder="therapist-id"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration">Session Duration (min)</Label>
              <Select value={sessionDuration} onValueChange={setSessionDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={runTimeTest} variant="outline" className="w-full">
                Test Time Conversion
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testOriginal} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Test Original Version
            </Button>
            <Button 
              onClick={testFixed} 
              disabled={loading}
              className="w-full"
            >
              Test Fixed Version
            </Button>
          </div>

          {timeTestResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{timeTestResult}</p>
            </div>
          )}

          {comparison && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-semibold text-yellow-800 mb-2">Comparison Results:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>Available slots difference: {comparison.availableDifference}</p>
                <p>Unavailable slots difference: {comparison.unavailableDifference}</p>
                {comparison.hasDifference && (
                  <p className="font-semibold">⚠️ Results differ between versions!</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Original Version</CardTitle>
          </CardHeader>
          <CardContent>
            {originalResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600">Available Slots ({originalResult.available?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {Array.isArray(originalResult.available) && originalResult.available.map((slot: Slot, index: number) => (
                      <div key={index} className="text-sm bg-green-50 p-1 rounded mb-1">
                        {(slot as Slot).start_time} - {(slot as Slot).end_time}
                      </div>
                    )) || <p className="text-gray-500">No available slots</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600">Unavailable Slots ({originalResult.unavailable?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {Array.isArray(originalResult.unavailable) && originalResult.unavailable.map((slot: Slot, index: number) => (
                      <div key={index} className="text-sm bg-red-50 p-1 rounded mb-1">
                        {(slot as Slot).start_time} - {(slot as Slot).end_time} ({slot.reason})
                      </div>
                    )) || <p className="text-gray-500">No unavailable slots</p>}
                  </div>
                </div>
                {typeof originalResult.error === 'string' && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 text-sm">Error: {originalResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No test run yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Fixed Version</CardTitle>
          </CardHeader>
          <CardContent>
            {fixedResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600">Available Slots ({fixedResult.available?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {Array.isArray(fixedResult.available) && fixedResult.available.map((slot: Slot, index: number) => (
                      <div key={index} className="text-sm bg-green-50 p-1 rounded mb-1">
                        {(slot as Slot).start_time} - {(slot as Slot).end_time}
                      </div>
                    )) || <p className="text-gray-500">No available slots</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600">Unavailable Slots ({fixedResult.unavailable?.length || 0})</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {Array.isArray(fixedResult.unavailable) && fixedResult.unavailable.map((slot: Slot, index: number) => (
                      <div key={index} className="text-sm bg-red-50 p-1 rounded mb-1">
                        {(slot as Slot).start_time} - {(slot as Slot).end_time} ({slot.reason})
                      </div>
                    )) || <p className="text-gray-500">No unavailable slots</p>}
                  </div>
                </div>
                {typeof fixedResult.error === 'string' && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 text-sm">Error: {fixedResult.error}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No test run yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 