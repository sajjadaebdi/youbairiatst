"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, DollarSign, Users, Clock, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  contentSubmissions: Array<{
    id: string;
    status: string;
  }>;
}

export default function SellerRewardsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    productDetails: '',
    contentType: '',
    requirements: '',
    budget: '',
    deadline: '',
    maxSubmissions: '10',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/rewards');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.productDetails || 
        !newTask.contentType || !newTask.requirements || !newTask.budget || !newTask.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Reward task created successfully!');
        setShowCreateDialog(false);
        setNewTask({
          title: '',
          description: '',
          productDetails: '',
          contentType: '',
          requirements: '',
          budget: '',
          deadline: '',
          maxSubmissions: '10',
        });
        fetchTasks();
      } else {
        toast.error(data.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/rewards/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Task deleted successfully');
        fetchTasks();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Reward Tasks</h1>
          <p className="text-gray-600">
            Manage your content reward opportunities and review submissions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Reward Task</DialogTitle>
              <DialogDescription>
                Set up a new content reward opportunity for marketers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Create Instagram Reel for Fitness App"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe what you're looking for..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="productDetails">Product Details *</Label>
                <Textarea
                  id="productDetails"
                  value={newTask.productDetails}
                  onChange={(e) => setNewTask({ ...newTask, productDetails: e.target.value })}
                  placeholder="Provide details about your product/service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contentType">Content Type *</Label>
                  <Select
                    value={newTask.contentType}
                    onValueChange={(value) => setNewTask({ ...newTask, contentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGC">UGC</SelectItem>
                      <SelectItem value="REEL">Reels</SelectItem>
                      <SelectItem value="TWEET">Tweets</SelectItem>
                      <SelectItem value="BLOG_POST">Blog Posts</SelectItem>
                      <SelectItem value="VIDEO">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newTask.budget}
                    onChange={(e) => setNewTask({ ...newTask, budget: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={newTask.requirements}
                  onChange={(e) => setNewTask({ ...newTask, requirements: e.target.value })}
                  placeholder="List specific requirements and guidelines..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxSubmissions">Max Submissions</Label>
                  <Input
                    id="maxSubmissions"
                    type="number"
                    value={newTask.maxSubmissions}
                    onChange={(e) => setNewTask({ ...newTask, maxSubmissions: e.target.value })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge className={getContentTypeColor(task.contentType)}>
                  {task.contentType}
                </Badge>
                <Badge variant={task.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {task.status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">${task.budget}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{task.totalSubmissions}/{task.maxSubmissions}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {formatDate(task.deadline)}</span>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className={getTimeLeft(task.deadline) === 'Expired' ? 'text-red-600' : ''}>
                    {getTimeLeft(task.deadline)}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/seller/rewards/${task.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't created any reward tasks yet.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Task
          </Button>
        </div>
      )}
    </div>
  );
}
