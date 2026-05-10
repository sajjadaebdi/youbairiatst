"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    paytmUpiId: '9368598307@paytm',
    merchantName: 'Digital Marketplace',
    currency: 'INR',
  });

  useEffect(() => {
    // Load current settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, you would fetch settings from an API
      // For now, we'll use the default values
      setSettings({
        paytmUpiId: '9368598307@paytm',
        merchantName: 'Digital Marketplace',
        currency: 'INR',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would save settings to an API
      // For now, we'll just show a success message
      toast.success('Payment settings updated successfully!');
      
      // Update the configuration file
      // Note: In a real app, you would update this via API
      console.log('Updated Paytm UPI ID to:', settings.paytmUpiId);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access payment settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Settings</h1>
        <p className="text-gray-600">
          Configure payment methods and settings for the Content Reward Program
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Paytm UPI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paytm UPI Configuration
            </CardTitle>
            <CardDescription>
              Configure your Paytm UPI ID for receiving payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paytmUpiId">Paytm UPI ID *</Label>
              <Input
                id="paytmUpiId"
                type="text"
                placeholder="your-upi-id@paytm"
                value={settings.paytmUpiId}
                onChange={(e) => setSettings({ ...settings, paytmUpiId: e.target.value })}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                This is the UPI ID where you will receive payments
              </p>
            </div>

            <div>
              <Label htmlFor="merchantName">Merchant Name</Label>
              <Input
                id="merchantName"
                type="text"
                placeholder="Your Business Name"
                value={settings.merchantName}
                onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                type="text"
                value={settings.currency}
                disabled
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Currently supporting INR only
              </p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={loading || !settings.paytmUpiId}
                className="w-full"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Payment Method:</span>
                <Badge variant="default">Paytm UPI</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">UPI ID:</span>
                <span className="font-mono text-sm">{settings.paytmUpiId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Currency:</span>
                <span>{settings.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant="outline" className="text-green-600">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Content Approval</p>
                  <p className="text-sm text-gray-600">Seller approves content submission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Admin Processing</p>
                  <p className="text-sm text-gray-600">Admin processes payout via Paytm UPI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Payment Transfer</p>
                  <p className="text-sm text-gray-600">Payment sent to your Paytm UPI ID</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Ensure your Paytm UPI ID is correct and active</p>
              <p>• Payments are processed in INR (Indian Rupees)</p>
              <p>• Processing time: 1-2 business days</p>
              <p>• Keep your UPI ID updated for seamless payments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
