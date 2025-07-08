"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  careerStage: string;
  avatar?: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  author: {
    userId?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    careerStage: string;
  };
  createdAt: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    userId?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function Blog() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBlogPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/signin');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/blog', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const data = await response.json();
      
      // 转换数据格式以符合前端接口
      const transformedPosts = data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        content: post.content,
        image: post.image,
        author: {
          userId: post.author.userId,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: post.author.avatar,
          careerStage: post.author.careerStage
        },
        createdAt: post.createdAt,
        likes: post.likes ? post.likes.length : 0,
        comments: (post.comments || []).map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          author: {
            userId: comment.author.userId,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            avatar: comment.author.avatar
          },
          createdAt: comment.createdAt
        })),
        isLiked: post.isLiked || false
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // 如果API失败，使用mock数据
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'My Journey into Tech: From Business to Software Engineering',
          content: 'After working in business for 5 years, I decided to make the leap into tech. Here\'s my story of transitioning careers and what I learned along the way...',
          image: '/images/blog1.jpg',
          author: {
            userId: 'mock-user-1',
            firstName: 'Sarah',
            lastName: 'Chen',
            avatar: '',
            careerStage: 'shining'
          },
          createdAt: '2024-01-15T10:30:00Z',
          likes: 24,
          comments: [
            {
              id: '1',
              content: 'This is so inspiring! I\'m also considering a career change.',
              author: {
                userId: 'mock-user-2',
                firstName: 'Emily',
                lastName: 'Johnson',
                avatar: ''
              },
              createdAt: '2024-01-15T11:00:00Z'
            }
          ],
          isLiked: false
        },
        {
          id: '2',
          title: 'Building My First Full-Stack Application',
          content: 'I just finished my first full-stack web application! It\'s a task management tool built with React and Node.js. The journey was challenging but incredibly rewarding...',
          author: {
            userId: 'mock-user-3',
            firstName: 'Lisa',
            lastName: 'Wang',
            avatar: '',
            careerStage: 'nextgen'
          },
          createdAt: '2024-01-14T09:15:00Z',
          likes: 18,
          comments: [],
          isLiked: true
        },
        {
          id: '3',
          title: 'Leadership Lessons from My First Tech Role',
          content: 'As a new team lead, I\'ve learned so much about managing people and projects in the tech industry. Here are the key insights that have helped me grow...',
          author: {
            userId: 'mock-user-4',
            firstName: 'Jessica',
            lastName: 'Martinez',
            avatar: '',
            careerStage: 'shining'
          },
          createdAt: '2024-01-13T14:22:00Z',
          likes: 32,
          comments: [
            {
              id: '2',
              content: 'Great insights! The part about giving constructive feedback really resonated with me.',
              author: {
                userId: 'mock-user-5',
                firstName: 'Maria',
                lastName: 'Rodriguez',
                avatar: ''
              },
              createdAt: '2024-01-13T15:00:00Z'
            },
            {
              id: '3',
              content: 'Thank you for sharing this. I\'m about to start my first leadership role and this is very helpful.',
              author: {
                userId: 'mock-user-6',
                firstName: 'Anna',
                lastName: 'Kim',
                avatar: ''
              },
              createdAt: '2024-01-13T16:30:00Z'
            }
          ],
          isLiked: false
        }
      ];
      setPosts(mockPosts);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({
          ...prev,
          image: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          image: newPost.image
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create post');
      }

      const data = await response.json();
      
      // 创建正确格式的帖子对象
      const newPostFormatted: BlogPost = {
        id: data.post.id || data.post._id,
        title: data.post.title,
        content: data.post.content,
        image: data.post.image,
        author: {
          userId: data.post.author.userId,
          firstName: data.post.author.firstName,
          lastName: data.post.author.lastName,
          avatar: data.post.author.avatar,
          careerStage: data.post.author.careerStage
        },
        createdAt: data.post.createdAt,
        likes: data.post.likes || 0,
        comments: [],
        isLiked: false
      };
      
      // 添加新帖子到列表顶部
      setPosts(prev => [newPostFormatted, ...prev]);
      setNewPost({ title: '', content: '', image: '' });
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(`Failed to create post: ${error.message}`);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blog/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: data.likes, isLiked: data.isLiked }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      // 如果API失败，回退到原本的客户端行为
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = newComment[postId]?.trim();
    if (!commentContent) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blog/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: commentContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();
      
      // 创建正确格式的评论对象
      const newCommentFormatted: Comment = {
        id: data.comment.id,
        content: data.comment.content,
        author: {
          userId: data.comment.author.userId,
          firstName: data.comment.author.firstName,
          lastName: data.comment.author.lastName,
          avatar: data.comment.author.avatar
        },
        createdAt: data.comment.createdAt
      };
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newCommentFormatted] }
          : post
      ));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      // 如果API失败，回退到原本的客户端行为
      const comment: Comment = {
        id: Date.now().toString(),
        content: commentContent,
        author: {
          userId: user?.id,
          firstName: user?.firstName || 'Anonymous',
          lastName: user?.lastName || 'User',
          avatar: user?.avatar
        },
        createdAt: new Date().toISOString()
      };

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      ));

      setNewComment(prev => ({ ...prev, [postId]: '' }));
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setNewComment(prev => ({ ...prev, [postId]: value }));
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('确定要删除这篇博客吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // 从列表中移除已删除的帖子
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(`删除帖子失败: ${error.message}`);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blog/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }

      // 从帖子中移除已删除的评论
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
          : post
      ));
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      alert(`删除评论失败: ${error.message}`);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${post.author.firstName} ${post.author.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/logo1.png"
            alt="LyraTech Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl font-semibold text-teal-600">LyraTech</span>
        </div>
        
        <div className="hidden md:flex space-x-8">
          <Link href="/dashboard" className="text-gray-700 hover:text-teal-600">Home</Link>
          <Link href="/learning-path" className="text-gray-700 hover:text-teal-600">Learning Path</Link>
          <Link href="/calendar" className="text-gray-700 hover:text-teal-600">Calendar</Link>
          <Link href="/achievements" className="text-gray-700 hover:text-teal-600">Achievements</Link>
          <Link href="/resources" className="text-gray-700 hover:text-teal-600">Resources</Link>
          <Link href="/blog" className="text-teal-600 font-medium">Blog</Link>
          <Link href="/events" className="text-gray-700 hover:text-teal-600">Events</Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 rounded-full px-4 py-1 flex items-center space-x-2">
            <span className={`text-sm font-medium ${user?.careerStage === 'nextgen' ? 'text-gray-700' : 'text-gray-500'}`}>
              NextGen Stars
            </span>
            <span className="text-gray-400">|</span>
            <span className={`text-sm ${user?.careerStage === 'shining' ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
              Shining Galaxy
            </span>
          </div>
          
          {/* User Avatar/Initials */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center cursor-pointer">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-teal-600 font-medium">
                  {user?.lastName ? user.lastName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible">
              <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Blog</h1>
              <p className="text-gray-600">Share your journey, insights, and connect with fellow tech professionals.</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Create Post
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search blog posts by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Create New Blog Post</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your blog title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Share your thoughts, experiences, or insights..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {newPost.image && (
                      <div className="mt-2">
                        <img src={newPost.image} alt="Preview" className="max-w-full h-32 object-cover rounded-md" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreatePost}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
                    >
                      Publish Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">📝</span>
              </div>
              <p className="text-gray-500 text-lg mb-2">No posts found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share your story!'}
              </p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt="Author"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-teal-600 font-medium">
                            {post.author.lastName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {post.author.firstName} {post.author.lastName}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            post.author.careerStage === 'nextgen' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {post.author.careerStage === 'nextgen' ? 'NextGen Stars' : 'Shining Galaxy'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 删除按钮 - 只有作者才能看到 */}
                    {user && post.author.userId === user.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                        title="删除帖子"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {formatContent(post.content)}
                  </div>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="px-6">
                    <div className="flex justify-center">
                      <img
                        src={post.image}
                        alt="Post"
                        className="max-w-full max-h-96 object-contain rounded-md"
                      />
                    </div>
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 ${
                          post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <span className="text-lg">{post.isLiked ? '❤️' : '🤍'}</span>
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-teal-600"
                      >
                        <span className="text-lg">💬</span>
                        <span className="text-sm font-medium">{post.comments.length}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments.includes(post.id) && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {/* Add Comment Input */}
                      <div className="mb-4">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt="Your avatar"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-teal-600 text-sm">
                                {user?.lastName ? user.lastName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={newComment[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              placeholder="Write a comment..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                            />
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment[post.id]?.trim()}
                                className="px-4 py-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md text-sm"
                              >
                                Comment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Existing Comments */}
                      <div className="space-y-3">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {comment.author.avatar ? (
                                <img
                                  src={comment.author.avatar}
                                  alt="Commenter"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 text-sm">
                                  {comment.author.lastName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm text-gray-900">
                                    {comment.author.firstName} {comment.author.lastName}
                                  </p>
                                  {/* 删除评论按钮 - 只有评论作者才能看到 */}
                                  {user && comment.author.userId === user.id && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-gray-400 hover:text-red-500 text-xs ml-2"
                                      title="删除评论"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                                <div className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                                  {formatContent(comment.content)}
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                        
                        {post.comments.length === 0 && (
                          <p className="text-gray-500 text-sm text-center py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Image
                  src="/images/logo2.png"
                  alt="LyraTech Logo"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                <span className="text-xl font-semibold">LyraTech</span>
              </div>
              <p className="text-gray-400 mt-2 text-sm">Empowering women's career development in tech</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Platform</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/dashboard/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/dashboard/contact" className="hover:text-white">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Resources</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link href="/events" className="hover:text-white">Events</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Legal</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li><Link href="/dashboard/terms" className="hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/dashboard/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} LyraTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 