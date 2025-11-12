'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Request } from '@/types/app-types';

export default function ManageRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const supabase = getSupabaseClient();

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('staff_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchRequests();
    const requestSub = supabase
      .channel('requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_requests' },
        () => fetchRequests()
      )
      .subscribe();
    return () => {
      void requestSub.unsubscribe();
    };
  }, [supabase, fetchRequests]);

  const handleApprove = async (id: string) => {
    // Simply delete the request when approved
    await supabase.from('staff_requests').delete().eq('id', id);
    fetchRequests();
  };

  const handleReject = async (id: string) => {
    await supabase.from('staff_requests').delete().eq('id', id);
    fetchRequests();
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Pending Stock Requests</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Request Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.id}</TableCell>
              <TableCell>{req.user_id}</TableCell>
              <TableCell>{req.request_type}</TableCell>
              <TableCell>{req.message}</TableCell>
              <TableCell>{req.status}</TableCell>
              <TableCell>{new Date(req.created_at || new Date()).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleApprove(req.id)}
                  className="mr-2"
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(req.id)}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
