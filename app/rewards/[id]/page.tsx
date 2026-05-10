"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, DollarSign, Users, Clock, User, FileText, Upload, Send } from 'lucide-react';
import { toast } from 'sonner';

interface RewardTask {
  id: string;
  title: string;
  description: string;
  productDetails: string;
  contentType: string;
  requirements: string;
  budget: number;
  deadline: string;
  maxSubmissions: number;
  totalSubmissions: number;
  approvedSubmissions: number;
  status: string;
  createdAt: string;
  seller: {
    shopName: string;
    user: {
      name: string;
      email: string;
    };
  };
  contentSubmissions: Array<{
    id: string;
    status: string;
    marketer: {
      user: {
        name: string;
        email: string;
      };
    };
  }>;
}

export default function RewardTaskPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<RewardTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState({
    content: '',
    mediaUrls: [] as string[],
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchTask();
    }
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/rewards/${params.id}`);
      const data = await response.json();
      setTask(data.task);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error('Please sign in to submit content');
      return;
    }

    if (!submission.content.trim()) {
      toast.error('Please provide content description');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task?.id,
          content: submission.content,
          mediaUrls: submission.mediaUrls,
          notes: submission.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Content submitted successfully!');
        setSubmission({ content: '', mediaUrls: [], notes: '' });
        fetchTask(); // Refresh task data
      } else {
        toast.error(data.error || 'Failed to submit content');
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      toast.error('Failed to submit content');
    } finally {
      setSubmitting(false);
    }
  };

  const getContentTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      UGC: 'bg-blue-100 text-blue-800',
      REEL: 'bg-purple-100 text-purple-800',
      TWEET: 'bg-green-100 text-green-800',
      BLOG_POST: 'bg-orange-100 text-orange-800',
      VIDEO: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const hasUserSubmitted = task?.contentSubmissions.some(
    sub => sub.marketer.user.email === session?.user?.email
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <p className="text-gray-600">The reward task you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Task Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={getContentTypeColor(task.contentType)}>
              {task.contentType}
            </Badge>
            <Badge variant={task.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {task.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
          <p className="text-gray-600 text-lg">{task.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Product Details</h3>
                  <p className="text-gray-700">{task.productDetails}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-gray-700">{task.requirements}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  {task.totalSubmissions} of {task.maxSubmissions} submissions received
                </CardDescription>
              </CardHeader>
              <CardContent>
                {task.contentSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {task.contentSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{submission.marketer.user.name}</p>
                            <p className="text-sm text-gray-600">{submission.marketer.user.email}</p>
                          </div>
                        </div>
                        <Badge variant={submission.status === 'APPROVED' ? 'default' : submission.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No submissions yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Budget</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">${task.budget}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Submissions</span>
                  </div>
                  <span>{task.totalSubmissions}/{task.maxSubmissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Deadline</span>
                  </div>
                  <span>{formatDate(task.deadline)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Time Left</span>
                  </div>
                  <span className={getTimeLeft(task.deadline) === 'Expired' ? 'text-red-600' : ''}>
                    {getTimeLeft(task.deadline)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{task.seller.shopName}</p>
                  <p className="text-sm text-gray-600">{task.seller.user.name}</p>
                  <p className="text-sm text-gray-600">{task.seller.user.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Content */}
            {session?.user && task.status === 'ACTIVE' && !hasUserSubmitted && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Content</CardTitle>
                  <CardDescription>
                    Share your content for this reward opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content">Content Description *</Label>
                    <Textarea
                      id="content"
                      placeholder="Describe your content submission..."
                      value={submission.content}
                      onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mediaUrls">Media URLs (optional)</Label>
                    <Input
                      id="mediaUrls"
                      placeholder="https://example.com/media1, https://example.com/media2"
                      value={submission.mediaUrls.join(', ')}
                      onChange={(e) => setSubmission({ 
                        ...submission, 
                        mediaUrls: e.target.value.split(',').map(url => url.trim()).filter(url => url)
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information..."
                      value={submission.notes}
                      onChange={(e) => setSubmission({ ...submission, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting || !submission.content.trim()}
                    className="w-full"
                  >
                    {submitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasUserSubmitted && (
              <Card>
                <CardHeader>
                  <CardTitle>Submission Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-green-600 font-medium">
                    You have already submitted content for this task
                  </p>
                </CardContent>
              </Card>
            )}

            {!session?.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Sign In Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 mb-4">
                    Please sign in to submit content for this task
                  </p>
                  <Button onClick={() => router.push('/signin')} className="w-full">
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
