# Pull Request System Implementation

This document describes the comprehensive Pull Request (PR) system implemented for the Enux playbook platform, providing GitHub-like functionality for collaborative playbook development.

## Features

### 🎯 Core Functionality
- **Create Pull Requests**: Users can create PRs with markdown editor prefilled with current content
- **PR Management**: View, merge, decline, and close pull requests
- **Diff Viewer**: Unified, side-by-side, and HTML diff viewing options
- **Status Tracking**: Open, Merged, Closed, and Declined status management
- **Role-based Actions**: Different permissions for authors, playbook owners, and admins

### 🔧 Technical Components

#### API Integration (`src/lib/api.ts`)
- `createPullRequest()` - Create new PRs
- `getPullRequests()` - List PRs for a playbook
- `getPullRequest()` - Get detailed PR information
- `getPullRequestDiff()` - Get diff in multiple formats
- `mergePullRequest()` - Merge PRs with optional message
- `closePullRequest()` - Close PRs
- `declinePullRequest()` - Decline PRs

#### UI Components

##### 1. CreatePRModal (`src/components/CreatePRModal.tsx`)
- Modal dialog for creating new PRs
- Markdown editor prefilled with current playbook content
- Form validation and error handling
- Success callback for navigation

##### 2. DiffViewer (`src/components/DiffViewer.tsx`)
- Tabbed interface for different diff formats
- Unified diff with syntax highlighting
- Side-by-side diff comparison
- HTML diff rendering
- Change statistics (additions/deletions)

##### 3. PullRequestList (`src/components/PullRequestList.tsx`)
- List view of all PRs for a playbook
- Status badges and icons
- Author and timestamp information
- Navigation to PR details
- Empty state with call-to-action

##### 4. PullRequestDetail (`src/pages/PullRequestDetail.tsx`)
- Comprehensive PR detail page
- Header with status, author, and timestamps
- Action buttons (Merge, Decline, Close)
- Diff viewer integration
- Content preview
- Sidebar with PR metadata

#### Page Integration

##### PlaybookDetail Updates (`src/pages/PlaybookDetail.tsx`)
- Added "Create PR" button in action bar
- Integrated PullRequestList component in sidebar
- Modal integration for PR creation
- Navigation to PR details on success

## API Endpoints

### Create Pull Request
```bash
POST /api/v1/pull-requests/playbooks/{playbook_id}/pull-requests
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Improve introduction section",
  "description": "This PR adds better explanations...",
  "new_blog_text": "# Updated content...",
  "base_version_id": "current_version_id_from_playbook_detail"
}
```

**Note:** The `base_version_id` should be the `current_version_id` field from the playbook detail API response (`/playbooks/{playbook_id}/detailed`).

### List Pull Requests
```bash
GET /api/v1/pull-requests/playbooks/{playbook_id}/pull-requests
Authorization: Bearer {token}
```

### Get Pull Request Details
```bash
GET /api/v1/pull-requests/{pr_id}
Authorization: Bearer {token}
```

### Get Pull Request Diff
```bash
GET /api/v1/pull-requests/{pr_id}/diff?format=unified
Authorization: Bearer {token}
```

### Merge Pull Request
```bash
POST /api/v1/pull-requests/{pr_id}/merge?merge_message=Optional%20merge%20message
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "MERGED",
  "new_version_id": "f0012413-3e75-4d97-8e15-858dc3cfd62e",
  "version_number": 3,
  "message": "mering PR and updating introduction"
}
```

### Close/Decline Pull Request
```bash
POST /api/v1/pull-requests/{pr_id}/close
POST /api/v1/pull-requests/{pr_id}/decline
Authorization: Bearer {token}
```

## Data Models

### PullRequest Interface
```typescript
interface PullRequest {
  id: string;
  playbook_id: string;
  author_id: string;
  base_version_id: string;
  title: string;
  description: string;
  old_blog_text: string;
  new_blog_text: string;
  unified_diff: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED' | 'DECLINED';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  merged_by: string | null;
  merge_message: string | null;
  new_version_id: string | null;
  author_name: string;
  playbook_title: string;
  base_version_number: number;
  new_version_number: number | null;
}
```

## User Experience Flow

### 1. Creating a Pull Request
1. User visits a playbook detail page
2. Clicks "Create PR" button (disabled for playbook owners)
3. Modal opens with current content prefilled and base version ID from API
4. User edits title, description, and content
5. Submits PR creation with correct `base_version_id`
6. Automatically navigates to new PR detail page

### 2. Managing Pull Requests
1. PR list shows on playbook detail page sidebar
2. Click on PR to view details
3. View diff in multiple formats
4. Take actions based on permissions:
   - **Merge**: Creates new version and updates playbook
   - **Decline**: Rejects changes with declined status
   - **Close**: Closes without merging

### 3. Diff Viewing
- **Unified**: Traditional diff format with +/- indicators
- **Side-by-side**: Parallel comparison view
- **HTML**: Rich HTML diff rendering
- Statistics show additions/deletions

## Security & Permissions

### Role-based Access Control
- **Playbook Owners**: Cannot create PRs for their own playbooks
- **Authenticated Users**: Can create PRs for others' playbooks
- **PR Authors**: Can close their own PRs
- **Playbook Owners/Admins**: Can merge, decline, or close any PR

### Authentication
- All PR operations require valid JWT token
- Token extracted from sessionStorage
- Automatic error handling for expired tokens

## Error Handling

### API Error Handling
- Network error detection and user-friendly messages
- Authentication error handling with redirect prompts
- Validation error display in forms
- Toast notifications for success/error states

### UI Error States
- Loading states with spinners
- Error boundaries for component failures
- Graceful degradation for missing data
- Retry mechanisms for failed requests

## Styling & Design

### Design System Integration
- Consistent with existing Enux design system
- Shadcn/ui components throughout
- Responsive design for mobile/desktop
- Dark mode support
- Accessibility considerations

### Color Coding
- **Green**: Open PRs, additions in diff
- **Purple**: Merged PRs
- **Red**: Declined PRs, deletions in diff
- **Gray**: Closed PRs, neutral states

## Future Enhancements

### Planned Features
- **Comments System**: Add comments to PRs
- **Review System**: Request reviews from specific users
- **Branch Management**: Support for multiple branches
- **Conflict Resolution**: Handle merge conflicts
- **Notifications**: Email/real-time notifications
- **PR Templates**: Predefined PR templates
- **Automated Testing**: CI/CD integration

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: Service worker for offline viewing
- **Performance**: Virtual scrolling for large PR lists
- **Search**: Advanced PR search and filtering
- **Export**: Export PRs as PDF/Word documents

## Testing

### Manual Testing Checklist
- [ ] Create PR from playbook detail page
- [ ] View PR list in sidebar
- [ ] Navigate to PR detail page
- [ ] View diff in all formats
- [ ] Merge PR successfully
- [ ] Decline PR successfully
- [ ] Close PR successfully
- [ ] Test permission restrictions
- [ ] Verify error handling
- [ ] Test responsive design

### Integration Testing
- [ ] API endpoint testing
- [ ] Authentication flow testing
- [ ] Error scenario testing
- [ ] Performance testing with large PRs

## Deployment

### Environment Variables
No additional environment variables required - uses existing API configuration.

### Build Process
No additional build steps required - all components are TypeScript/React.

### Dependencies
All required dependencies are already included in the project:
- React Router for navigation
- Shadcn/ui for components
- Lucide React for icons
- Existing API utilities

## Support

For issues or questions about the PR system:
1. Check the API documentation
2. Review error messages in browser console
3. Verify authentication status
4. Test with different user roles
5. Check network connectivity

---

This PR system provides a robust foundation for collaborative playbook development, following GitHub's proven patterns while being tailored for the Enux platform's specific needs.
