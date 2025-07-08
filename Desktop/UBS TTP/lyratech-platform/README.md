# LyraTech Platform

A comprehensive learning platform designed for women in tech, built with Next.js, TypeScript, and MongoDB. LyraTech empowers women's career development in the technology field through personalized learning paths, blog community, event management, and achievement tracking systems.

## Platform Naming Story

LyraTech's name originates from the constellation Lyra, which contains Vega - one of the brightest stars in the night sky. In ancient mythology, Lyra represents Orpheus's harp, whose melodies could move mountains, fill seas, and calm storms.

Just as Vega was once the North Star and will become the North Star again in the future, LyraTech believes that women's leadership positions in the tech field will continuously rotate and shine. We are committed to being the guiding star for women's tech career navigation, allowing every woman to shine brightly in the tech galaxy.

## Core Features

### 🎯 Personalized Learning Paths
- **NextGen Stars**: Technical skill development for students and junior professionals
- **Shining Galaxy**: Leadership and management capability development for mid to senior-level professionals
- 20 technical skill modules, 15 behavioral interview modules, 10 practical projects
- Intelligent progress tracking and level assessment system

### 📚 Comprehensive Resource Center
- 200+ curated video tutorials covering frontend, backend, database, and other technical areas
- Behavioral skills training resources (leadership, communication, teamwork, etc.)
- Practical project guidance and portfolio building
- Expandable/collapsible resource browsing experience

### 💬 Community Blog Platform
- User-created and shared technical blogs
- Like, comment, and community interaction features
- Career stage identification (NextGen Stars / Shining Galaxy)
- Real-time content publishing and deletion management

### 📅 Smart Calendar Management
- Multi-type event support (learning, work, personal, deadlines, etc.)
- Recurring events and reminder system
- Priority management and color coding
- Integration with learning path progress scheduling

### 🏆 Achievement Tracking System
- Learning progress visualization and milestone badges
- Level progression system (Beginner → Intermediate → Advanced → Expert)
- Personalized goal setting and tracking
- Community achievement sharing

### 🎪 Events & Activities
- Upcoming learning events and networking activities
- Community event suggestions and participation
- Contact email: lyratech.platform@gmail.com

### 🔐 Complete User System
- Secure user registration and login system
- Personal profile management and avatar settings
- Career stage selection and progress tracking
- Complete footer link system (About Us, Contact Us, Terms of Service, Privacy Policy)

## Tech Stack

- **Frontend**: Next.js 15.3.2, React 19, TypeScript 5, Tailwind CSS 4
- **Backend**: Next.js API Routes, MongoDB, Mongoose 8.15.1
- **Authentication**: JWT + bcryptjs
- **UI Components**: Heroicons, React Calendar, React Time Picker
- **Database**: MongoDB with Mongoose ODM
- **Date Handling**: date-fns 4.1.0
- **Email System**: Nodemailer 7.0.3

## Quick Start

### Environment Requirements

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation Steps

1. Clone repository:
```bash
git clone https://github.com/XuJiaqi888/lyratech-platform.git
cd lyratech-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set environment variables:
```bash
cp .env.example .env.local
```

In `.env.local` configure the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
```

4. Start development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Architecture

```
lyratech-platform/
├── src/
│   ├── app/                    # Next.js 14+ app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # User authentication API
│   │   │   ├── blog/          # Blog related API
│   │   │   ├── calendar/      # Calendar event API
│   │   │   ├── learning-path/ # Learning path API
│   │   │   ├── learning-resources/ # Learning resource API
│   │   │   └── achievements/  # Achievement system API
│   │   ├── dashboard/         # User dashboard
│   │   │   ├── about/         # About us page
│   │   │   ├── contact/       # Contact us page
│   │   │   ├── terms/         # Terms of service page
│   │   │   └── privacy/       # Privacy policy page
│   │   ├── learning-path/     # Learning path system
│   │   ├── calendar/          # Calendar feature
│   │   ├── achievements/      # Achievement system
│   │   ├── resources/         # Resource center
│   │   ├── blog/              # Blog community
│   │   ├── events/            # Event page
│   │   ├── profile/           # User profile
│   │   ├── signin/            # Login page
│   │   ├── register/          # Register page
│   │   ├── about/             # Public about page
│   │   ├── terms/             # Public terms of service
│   │   ├── privacy/           # Public privacy policy
│   │   └── page.tsx           # Home page
│   ├── data/                  # Static data files
│   │   └── learningResources.js # Learning resource data
│   ├── models/                # MongoDB data models
│   ├── lib/                   # Utility functions and configuration
│   └── scripts/               # Script files
├── public/                    # Static resources
│   └── images/               # Image resources
└── docs/                     # Project documentation
```

## API Endpoints

### User Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Learning Path System
- `GET /api/learning-path` - Get user learning path
- `POST /api/learning-path` - Create/update learning path
- `PUT /api/learning-path` - Update module completion status
- `GET /api/learning-path/progress` - Get progress summary

### Blog Community
- `GET /api/blog` - Get blog article list
- `POST /api/blog` - Create new blog article
- `DELETE /api/blog/[id]` - Delete blog article
- `POST /api/blog/[id]/like` - Like/unlike
- `POST /api/blog/[id]/comment` - Add comment
- `DELETE /api/blog/[id]/comment/[commentId]` - Delete comment

### Calendar Events
- `GET /api/calendar` - Get user event list
- `POST /api/calendar` - Create new event
- `GET /api/calendar/[eventId]` - Get specific event
- `PUT /api/calendar/[eventId]` - Update event
- `DELETE /api/calendar/[eventId]` - Delete event
- `GET /api/calendar/recent` - Get recent events (for dashboard)

### Learning Resources
- `GET /api/learning-resources` - Get learning resources
- `POST /api/learning-resources/progress` - Update learning resource progress

### Achievement System
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements` - Unlock new achievement

## Feature Detailed Description

### Learning Path System

#### 1. Technical Skills (20 modules)
- JavaScript basics
- React basics
- Node.js introduction
- Database design
- API development
- Testing basics
- Version control (Git)
- Cloud computing basics
- Security best practices
- Performance optimization
- Data structures
- Algorithms
- System design
- DevOps basics
- Microservices architecture
- Machine learning basics
- Mobile development
- Frontend frameworks
- Backend architecture
- Project management tools

#### 2. Behavioral Interview (15 modules)
- Leadership scenarios
- Team collaboration
- Problem solving
- Communication skills
- Conflict resolution
- Time management
- Adaptability
- Decision making
- Customer orientation
- Innovative thinking
- Stress management
- Goal setting
- Feedback reception
- Cultural awareness
- Moral dilemma

#### 3. Practical Projects (10 modules)
- Personal portfolio website
- Task management application
- E-commerce platform
- Data visualization dashboard
- Mobile application development
- API integration project
- Database management system
- Machine learning model
- Cloud deployment project
- Open source contribution

#### Level Progression System
- **Beginner**: 0-29% completion
- **Intermediate**: 30-59% completion
- **Advanced**: 60-79% completion
- **Expert**: 80-100% completion

### Blog Community System

#### Feature Features
- ✅ Create and publish blog articles
- ✅ Image upload and preview
- ✅ Like and comment system
- ✅ Real-time content search
- ✅ User identity identification (NextGen Stars / Shining Galaxy)
- ✅ Article and comment deletion permission management
- ✅ Responsive design and modern UI

#### Content Management
- Support for multi-line text and line breaks
- Real-time character counting and verification
- Image compression and format support
- Content review and spam filtering

### Calendar Management System

#### Feature Features
- ✅ Monthly view calendar using react-calendar
- ✅ Event type filtering (learning meetings, personal affairs, work, deadlines, meetings, other)
- ✅ Event creation and date/time selection
- ✅ Recurring events (daily, weekly, monthly, yearly)
- ✅ Priority setting (high, medium, low)
- ✅ Email reminder system
- ✅ Event editing and deletion
- ✅ Color-coded event type
- ✅ Dashboard integrated display of recent events
- ✅ Integration with learning path scheduling

#### Event Types
- **Learning Meeting**: Planned learning activities
- **Personal Affairs**: Personal appointments and activities
- **Work**: Events and meetings related to work
- **Deadline**: Important deadlines and expiration dates
- **Meeting**: Planned meetings and calls
- **Other**: Miscellaneous events

#### Technical Implementation
- Use `react-calendar` to build calendar interface
- Use `date-fns` for date operations
- Use `react-time-picker` for time selection
- MongoDB stores complete event architecture
- Real-time update and optimistic UI update

### Resource Center System

#### Feature Features
- ✅ 200+ curated video tutorials
- ✅ Organized by technical area
- ✅ Expandable/collapsible resource browsing
- ✅ Progress tracking and completion marking
- ✅ Search and filtering features
- ✅ Latest 2024-2025 content

#### Resource Classification
- **Technical Skills**: Frontend, backend, database, DevOps
- **Behavioral Skills**: Leadership, communication, teamwork
- **Practical Projects**: End-to-end project building guide
- **Additional Resources**: Book recommendations, interview preparation

## Database Architecture

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  careerStage: String, // 'nextgen' | 'shining'
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Learning Path Model
```javascript
{
  userId: ObjectId,
  selectedAreas: {
    technicalSkills: Boolean,
    behavioralQuestions: Boolean,
    practicalProjects: Boolean
  },
  progress: {
    technicalSkills: { completed: Number, total: Number, modules: [...] },
    behavioralQuestions: { completed: Number, total: Number, modules: [...] },
    practicalProjects: { completed: Number, total: Number, modules: [...] }
  },
  overallProgress: Number,
  currentLevel: String,
  estimatedCompletionWeeks: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Article Model
```javascript
{
  title: String,
  content: String,
  image: String,
  author: {
    userId: ObjectId,
    firstName: String,
    lastName: String,
    careerStage: String,
    avatar: String
  },
  likes: [{ userId: ObjectId, createdAt: Date }],
  comments: [{
    id: String,
    content: String,
    author: {
      userId: ObjectId,
      firstName: String,
      lastName: String,
      avatar: String
    },
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  startTime: String,
  endTime: String,
  type: String, // 'learning' | 'personal' | 'work' | 'deadline' | 'meeting' | 'other'
  priority: String, // 'high' | 'medium' | 'low'
  location: String,
  color: String,
  isRecurring: Boolean,
  recurrence: {
    frequency: String, // 'daily' | 'weekly' | 'monthly' | 'yearly'
    endDate: Date,
    count: Number
  },
  reminder: {
    enabled: Boolean,
    time: Number, // minutes before event
    method: String // 'email'
  },
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Example

### Create Learning Path
```javascript
const response = await fetch('/api/learning-path', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    selectedAreas: {
      technicalSkills: true,
      behavioralQuestions: true,
      practicalProjects: false
    }
  })
});
```

### Publish Blog Article
```javascript
const response = await fetch('/api/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Tech Learning Journey',
    content: 'Sharing my experience transitioning from business to software engineering...',
    image: 'data:image/jpeg;base64,...'
  })
});
```

### Add Calendar Event
```javascript
const response = await fetch('/api/calendar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'React Learning Meeting',
    startDate: '2024-01-15',
    startTime: '14:00',
    endTime: '16:00',
    type: 'learning',
    priority: 'high'
  })
});
```

## Development & Deployment

### Run Tests
```bash
npm run test
# or
yarn test
```

### Production Build
```bash
npm run build
# or
yarn build
```

### Code Style
- ESLint and Prettier configured
- TypeScript strict mode enabled
- Tailwind CSS for styling

### Deployment Options

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel console
3. Push to main branch for automatic deployment

#### Manual Deployment
1. Build project: `npm run build`
2. Start production server: `npm start`

## Dependencies

### Core Dependencies
```json
{
  "next": "15.3.2",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5",
  "mongoose": "^8.15.1",
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "date-fns": "^4.1.0",
  "react-calendar": "^6.0.0",
  "react-time-picker": "^7.0.0",
  "@heroicons/react": "^2.2.0",
  "nodemailer": "^7.0.3"
}
```

### Development Dependencies
```json
{
  "tailwindcss": "^4",
  "eslint": "^9",
  "eslint-config-next": "15.3.2",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19"
}
```

## Best Practices

1. **Data Integrity**: Always validate user input before database operations
2. **Progress Calculation**: Use MongoDB pre-save hooks for automatic calculation
3. **User Experience**: Provide immediate feedback for all user operations
4. **Scalability**: Design modules for easy expansion
5. **Performance**: Use optimized queries to get dashboard data
6. **Security**: Implement appropriate authentication and authorization
7. **Code Quality**: Follow TypeScript best practices and maintain test coverage

## Future Enhancement Features

- [ ] Custom learning path creation
- [ ] AI-driven module recommendation
- [ ] Integration with external learning platforms
- [ ] Peer learning and collaboration features
- [ ] Advanced analysis and reporting
- [ ] Certification and credential management
- [ ] Mobile application
- [ ] Video call integration for guidance
- [ ] Gameification features
- [ ] Community forum and discussion

## Contribution Guidelines

1. Fork this repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Support

For support and consultation:
- Create issue on GitHub
- Contact development team: lyratech.platform@gmail.com
- View documentation in `/docs` folder

## Acknowledgments

- Built with Next.js and React ecosystem
- UI design inspired by modern design system
- Community contributions and feedback
- MongoDB database solution
- Thanks to all who contributed to women's tech education

---

**LyraTech Platform** - Educating and empowering women in tech, like Vega shining in the tech galaxy.

## Update Log

### v0.1.0 (Current)
- ✅ Complete user authentication system
- ✅ Personalized learning paths (NextGen Stars & Shining Galaxy)
- ✅ Comprehensive resource center (200+ video tutorials)
- ✅ Blog community platform
- ✅ Smart calendar management
- ✅ Achievement tracking system
- ✅ Event and activity pages
- ✅ Complete footer link system (About Us, Contact Us, Terms of Service, Privacy Policy)
- ✅ Responsive design and modern UI
- ✅ Exclusive page for logged-in users
