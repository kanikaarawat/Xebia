'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  license_number: string;
  avatar_url?: string;
}

interface TherapistSelectorProps {
  therapistId: string;
  onTherapistChange: (id: string) => void;
  selectedTherapist: Therapist | null;
}

export default function TherapistSelector({ 
  therapistId, 
  onTherapistChange, 
  selectedTherapist 
}: TherapistSelectorProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTherapists = async () => {
      console.log('🔍 Starting to fetch therapists...');
      
      const { data, error } = await supabase
        .from('therapists')
        .select(`
          id,
          specialization,
          license_number,
          profile:profiles (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('profiles(first_name)');

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Error fetching therapists:', error);
        setError('Failed to load therapists');
      } else {
        console.log("Fetched therapists:", data);
        
        const therapistsWithAvatars = data?.map(t => {
          const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile;
          return {
            id: t.id,
            name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
            specialization: t.specialization,
            license_number: t.license_number,
            avatar_url: profile?.avatar_url || null
          };
        }) || [];
        
        console.log('🎯 Processed therapists:', therapistsWithAvatars);
        setTherapists(therapistsWithAvatars);
      }
      setLoading(false);
    };

    fetchTherapists();
  }, []);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
        <User className="w-5 h-5" />
        Select Your Therapist
      </Label>
      
      <Select
        value={therapistId}
        onValueChange={onTherapistChange}
        required
        disabled={loading}
      >
        <SelectTrigger className="h-12 text-lg bg-white border-slate-200 hover:bg-slate-50">
          <SelectValue placeholder={loading ? 'Loading therapists...' : 'Choose a therapist'} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
          {therapists.map((therapist) => (
            <SelectItem key={therapist.id} value={therapist.id} className="hover:bg-slate-100">
              <div className="flex items-center space-x-3 py-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={therapist.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-indigo-400 text-white">
                    {therapist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-slate-700">{therapist.name}</div>
                  <div className="text-sm text-indigo-600 font-medium">{therapist.specialization}</div>
                  <div className="text-xs text-slate-500">License: {therapist.license_number}</div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-xs mb-1">
                    Licensed
                  </Badge>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </SelectItem>
          ))}
          {!loading && therapists.length === 0 && (
            <div className="px-3 py-4 text-center text-slate-500">
              No therapists available at the moment
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Selected Therapist Info */}
      {selectedTherapist && (
        <div className="p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={selectedTherapist.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-indigo-400 text-white">
                  {selectedTherapist.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-lg font-semibold text-slate-700">{selectedTherapist.name}</h4>
                <p className="text-indigo-600 font-medium">{selectedTherapist.specialization}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-slate-500">License: {selectedTherapist.license_number}</span>
                  <Badge variant="outline" className="text-xs">
                    Verified Professional
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-green-600 mt-1">Available</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 