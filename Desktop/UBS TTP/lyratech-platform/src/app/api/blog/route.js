import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';

// 保留MongoDB客户端用于博客帖子操作
const client = new MongoClient(process.env.MONGODB_URI);

async function getUser(token) {
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - 获取所有博客帖子
export async function GET(request) {
  try {
    const authorization = request.headers.get('authorization');
    const currentUser = await getUser(authorization);
    
    await client.connect();
    const db = client.db('lyratech');
    const posts = await db.collection('blogPosts')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // 转换数据格式，包含当前用户的点赞状态
    const transformedPosts = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      content: post.content,
      image: post.image,
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes || [],
      comments: post.comments || [],
      isLiked: currentUser ? (post.likes || []).includes(currentUser.id) : false
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// POST - 创建新的博客帖子
export async function POST(request) {
  try {
    const authorization = request.headers.get('authorization');
    const user = await getUser(authorization);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, image } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // 使用mongoose连接获取用户信息
    await dbConnect();
    const userData = await User.findById(user.id);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // 使用MongoDB客户端操作博客帖子
    await client.connect();
    const db = client.db('lyratech');

    const newPost = {
      title,
      content,
      image: image || null,
      author: {
        userId: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.avatar || null,
        careerStage: userData.careerStage
      },
      createdAt: new Date(),
      likes: [],
      comments: []
    };

    const result = await db.collection('blogPosts').insertOne(newPost);
    
    return NextResponse.json({
      post: {
        id: result.insertedId.toString(),
        ...newPost,
        likes: 0,
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post', details: error.message },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 