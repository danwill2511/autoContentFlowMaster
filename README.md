# AutoContentFlow

AutoContentFlow is a full-stack SaaS platform that leverages AI to streamline content generation and social media management for digital creators, focusing on automated workflow solutions and enhanced user productivity.

## Features

- **AI-Powered Content Generation**: Create high-quality content with OpenAI GPT-4o
- **Platform Integrations**: Connect with popular social media platforms
- **Automated Workflows**: Create, schedule, and deploy content automatically
- **Content Performance Analytics**: Track engagement and analyze content performance
- **Subscription-Based Access**: Multiple tiers of service based on user needs

## New UI Enhancements

### Gamification Features
- **Achievement Badges**: Track progress with visual achievement badges
- **User Engagement Tracker**: Monitor content creation progress and user level
- **Statistics & Rewards**: Earn points for content creation milestones

### Interactive Components
- **AI Assistant**: Context-aware chatbot to help with content creation
- **Theme Switcher**: Customize application colors with one click
- **Shopify Integration**: Connect to Shopify store for product content creation
- **Animated Elements**: Micro-interactions for a more engaging dashboard

### Performance Improvements
- **Skeleton Loaders**: Visual placeholders for content loading states
- **Error Boundaries**: Graceful error handling throughout the application

## Tech Stack

- **Frontend**: React with TypeScript and Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Secure session-based authentication
- **Styling**: Tailwind CSS with shadcn/ui components
- **Testing**: Playwright for end-to-end testing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values
   - Required API keys: `OPENAI_API_KEY`, `PAYPAL_CLIENT_ID`, etc.

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Testing

Run automated tests using Playwright:

```
./run-tests.sh
```

See the `tests/README.md` file for more details on testing.

## Component Showcase

The application includes a showcase page at `/showcase` that demonstrates all the new UI components.

## Project Structure

- `client/` - React frontend application
- `server/` - Express backend API
- `shared/` - Shared types and schemas
- `tests/` - Playwright end-to-end tests

## Authentication

The application supports:
- Username/password authentication
- Session-based authentication
- User permission levels based on subscription

## Subscription Plans

- **Free**: Basic content creation with limited platforms
- **Essential**: Advanced content generation with more platforms
- **Pro**: Premium features including analytics and unlimited content
- **Business**: Enterprise features with team collaboration