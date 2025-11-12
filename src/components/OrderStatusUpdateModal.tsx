'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Send } from 'lucide-react';
import { updateOrderStatus } from '@/app/admin/actions';

interface OrderStatusUpdateModalProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', description: 'Order received, waiting for confirmation' },
  { value: 'confirmed', label: 'Confirmed', description: 'Order confirmed, payment processed' },
  { value: 'preparing', label: 'Preparing', description: 'Kitchen is preparing the order' },
  { value: 'ready', label: 'Ready', description: 'Order ready for pickup/delivery' },
  { value: 'completed', label: 'Completed', description: 'Order completed and delivered' },
  { value: 'cancelled', label: 'Cancelled', description: 'Order cancelled' },
];

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  confirmed: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  preparing: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  ready: 'bg-green-500/20 text-green-300 border-green-500/50',
  completed: 'bg-green-600/20 text-green-400 border-green-600/50',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/50',
};

export default function OrderStatusUpdateModal({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: OrderStatusUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      const additionalData: {
        estimatedReadyTime?: string;
        completionTime?: string;
      } = {};
      
      // Add estimated ready time for preparing status
      if (selectedStatus === 'preparing' && estimatedMinutes) {
        const minutes = parseInt(estimatedMinutes);
        if (!isNaN(minutes)) {
          additionalData.estimatedReadyTime = `${minutes} minutes`;
        }
      }
      
      // Add completion time for completed status
      if (selectedStatus === 'completed') {
        additionalData.completionTime = new Date().toISOString();
      }

      const response = await updateOrderStatus(orderId, selectedStatus);
      
      if (response.success) {
        console.log(`✅ Order ${orderId} status updated to ${selectedStatus}`);
        onStatusUpdate();
        setIsOpen(false);
        setEstimatedMinutes('');
      } else {
        console.error('❌ Failed to update order status:', response.error);
        alert('Failed to update order status: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('An error occurred while updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDescription = (status: string) => {
    return statusOptions.find(option => option.value === status)?.description || '';
  };

  const getNotificationMessage = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '📧 Customer will receive order confirmation email';
      case 'preparing':
        return '📧 Customer will receive "order being prepared" email with estimated time';
      case 'ready':
        return '📧 Customer will receive "order ready" email with pickup/delivery instructions';
      case 'completed':
        return '📧 Customer will receive "order completed" email with feedback request';
      case 'cancelled':
        return '📧 Customer will receive order cancellation email with refund information';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-neonCyan/20 border border-neonCyan text-neonCyan hover:bg-neonCyan hover:text-black"
        >
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/90 border border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-neonCyan" />
            Update Order Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div>
            <Label className="text-gray-300 text-sm font-medium">Current Status</Label>
            <div className="mt-2">
              <Badge className={statusColors[currentStatus as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-300'}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <Label className="text-gray-300 text-sm font-medium">New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-2 bg-black/70 border-gray-600 text-white">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-gray-600">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[option.value as keyof typeof statusColors]}>
                        {option.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStatus && (
              <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  {getStatusDescription(selectedStatus)}
                </p>
              </div>
            )}
          </div>

          {/* Estimated Time Input for Preparing Status */}
          {selectedStatus === 'preparing' && (
            <div>
              <Label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Ready Time (minutes)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 15"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="mt-2 bg-black/70 border-gray-600 text-white"
                min="1"
                max="120"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be included in the customer notification email
              </p>
            </div>
          )}

          {/* Notification Preview */}
          {selectedStatus && selectedStatus !== currentStatus && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">Notification Preview</p>
                  <p className="text-blue-200 text-xs mt-1">
                    {getNotificationMessage(selectedStatus)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-600">
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || selectedStatus === currentStatus || isUpdating}
              className="flex-1 bg-neonCyan text-black hover:bg-neonCyan/80 disabled:bg-gray-600 disabled:text-gray-400"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Update & Notify
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
