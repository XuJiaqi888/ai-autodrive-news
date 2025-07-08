import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

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

// DELETE - 删除博客帖子
export async function DELETE(request, { params }) {
  try {
    const authorization = request.headers.get('authorization');
    const user = await getUser(authorization);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { postId } = params;

    await client.connect();
    const db = client.db('lyratech');
    
    // 查找帖子并验证作者
    const post = await db.collection('blogPosts').findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // 检查是否是帖子作者
    if (post.author.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // 删除帖子
    await db.collection('blogPosts').deleteOne({ _id: new ObjectId(postId) });
    
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
} 