"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Users, Clock, ArrowRight } from 'lucide-react';
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
  }>;
}

export default function RewardsPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    contentType: 'all',
    minBudget: '',
    maxBudget: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.contentType && filters.contentType !== 'all') params.append('contentType', filters.contentType);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);

      const response = await fetch(`/api/rewards?${params}`);
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Reward Opportunities</h1>
        <p className="text-gray-600">
          Browse available marketing tasks and earn rewards for your content creation skills
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select
              value={filters.contentType}
              onValueChange={(value) => setFilters({ ...filters, contentType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="UGC">UGC</SelectItem>
                <SelectItem value="REEL">Reels</SelectItem>
                <SelectItem value="TWEET">Tweets</SelectItem>
                <SelectItem value="BLOG_POST">Blog Posts</SelectItem>
                <SelectItem value="VIDEO">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Min Budget</label>
            <Input
              type="number"
              placeholder="Min $"
              value={filters.minBudget}
              onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Budget</label>
            <Input
              type="number"
              placeholder="Max $"
              value={filters.maxBudget}
              onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ contentType: 'all', minBudget: '', maxBudget: '' })}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
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

                <div className="text-sm text-gray-600">
                  <strong>Seller:</strong> {task.seller.shopName}
                </div>

                <div className="pt-2">
                  <Link href={`/rewards/${task.id}`}>
                    <Button className="w-full" disabled={task.status !== 'ACTIVE'}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reward tasks found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
