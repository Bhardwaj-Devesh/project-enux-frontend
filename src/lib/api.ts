import { API_BASE_URL } from './utils';

export interface PlaybookUploadRequest {
  title: string;
  description: string;
  owner_id: string;
  files: File[];
  blog_content: string;
}

export interface PlaybookUploadResponse {
  playbook: {
    id: string;
    title: string;
    description: string;
    blog_content: string;
    tags: string[];
    stage: string;
    owner_id: string;
    version: string;
    files: Record<string, string>;
    created_at: string;
    updated_at: string;
    summary: string;
    vector_embedding: any;
  };
  files: Array<{
    filename: string;
    content_type: string;
    size: number;
    file_path: string;
  }>;
  processing_status: string;
  message: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  blog_content: string | null;
  tags: string[];
  stage: string;
  owner_id: string;
  version: string;
  files: Record<string, string>;
  created_at: string;
  updated_at: string;
  summary: string;
  vector_embedding: any;
}

export interface SearchResult {
  playbook: Playbook;
  similarity_score: number;
}

export interface SearchPlaybooksRequest {
  query: string;
  limit?: number;
}

export async function searchPlaybooks(data: SearchPlaybooksRequest): Promise<SearchResult[]> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const params = new URLSearchParams({
      query: data.query,
      ...(data.limit && { limit: data.limit.toString() })
    });

    const response = await fetch(`${API_BASE_URL}/playbooks/search/vector?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function uploadPlaybook(data: PlaybookUploadRequest): Promise<PlaybookUploadResponse> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        console.log('User data structure:', userDataParsed); // Debug log to see the structure
        // Try different possible token field names
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const formData = new FormData();
    
    // Add text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('owner_id', data.owner_id);
    formData.append('blog_content', data.blog_content);
    
    // Add files
    data.files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/playbooks/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  playbook_id: string;
  playbook_title: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  fork_id?: string;
  pr_id?: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationCount {
  unread_count: number;
  total_count: number;
}

export interface MarkReadRequest {
  notification_ids: string[];
}

export interface MarkReadResponse {
  updated_count: number;
  message: string;
}

export interface MarkAllReadResponse {
  updated_count: number;
  message: string;
}

export interface DeleteNotificationResponse {
  message: string;
}

export interface EnhancedPlaybook extends Playbook {
  fork_count: number;
  is_fork: boolean;
  forked_at: string | null;
  original_playbook_id: string | null;
  star_count: number;
  view_count: number;
}

export interface ForkInfo {
  user_id: string;
  user_email: string;
  user_full_name: string;
  forked_at: string;
  version: string;
}

export interface DetailedPlaybook extends Playbook {
  fork_count: number;
  forks: ForkInfo[];
  current_version_id: string;
  star_count: number;
  view_count: number;
  is_starred?: boolean;
}

export interface ForkResponse {
  status: string;
  new_playbook_id: string;
  new_playbook_url: string;
  message: string;
}

export interface ForkRequest {
  playbook_id: string;
  user_id: string;
}

export async function getNotifications(limit?: number): Promise<Notification[]> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const params = new URLSearchParams();
    if (limit) {
      params.append('limit', limit.toString());
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getNotificationCount(): Promise<NotificationCount> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function markNotificationsAsRead(notificationIds: string[]): Promise<MarkReadResponse> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notification_ids: notificationIds
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<MarkAllReadResponse> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications/mark-all-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function deleteNotification(notificationId: string): Promise<DeleteNotificationResponse> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getEnhancedPlaybooks(): Promise<EnhancedPlaybook[]> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/my-playbooks-enhanced`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getDetailedPlaybook(playbookId: string): Promise<DetailedPlaybook> {
  try {
    // Get authentication token from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/${playbookId}/detailed`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function forkPlaybook(playbookId: string): Promise<ForkResponse> {
  try {
    // Get authentication token and user data from sessionStorage
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    let userId = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        console.log('Parsed user data:', userDataParsed); // Debug log
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
        // Handle nested user structure
        if (userDataParsed.user && userDataParsed.user.id) {
          userId = userDataParsed.user.id;
          console.log('Found user ID from nested structure:', userId); // Debug log
        } else {
          userId = userDataParsed.id || userDataParsed.user_id;
          console.log('Found user ID from flat structure:', userId); // Debug log
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    if (!userId) {
      throw new Error('User ID not found. Please sign in again.');
    }

    const requestBody = {
      playbook_id: playbookId,
      user_id: userId
    };

    const response = await fetch(`${API_BASE_URL}/playbooks/fork`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

// Pull Request Types and Interfaces
export interface PullRequest {
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

export interface CreatePullRequestRequest {
  title: string;
  description: string;
  new_blog_text: string;
  base_version_id: string;
}

export interface CreatePullRequestResponse {
  pull_request: PullRequest;
  message: string;
}

export interface PullRequestListResponse {
  pull_requests: PullRequest[];
  total_count: number;
  has_more: boolean;
}

export interface SideBySideLine {
  line: number;
  content: string;
  type: 'unchanged' | 'added' | 'deleted';
}

export interface SideBySideDiff {
  has_changes: boolean;
  old_lines: SideBySideLine[];
  new_lines: SideBySideLine[];
  changes: Array<{
    type: string;
    old_start: number;
    old_end: number;
    new_start: number;
    new_end: number;
  }>;
}

export interface PullRequestDiffResponse {
  unified_diff: string;
  side_by_side_diff?: SideBySideDiff;
  html_diff?: string;
  format?: string;
}

export interface MergePullRequestRequest {
  merge_message?: string;
}

export interface MergePullRequestResponse {
  status: string;
  new_version_id: string;
  version_number: number;
  message: string;
}

// Pull Request API Functions
export async function createPullRequest(
  playbookId: string, 
  data: CreatePullRequestRequest
): Promise<CreatePullRequestResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/playbooks/${playbookId}/pull-requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getPullRequests(playbookId: string): Promise<PullRequestListResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/playbooks/${playbookId}/pull-requests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getPullRequest(prId: string): Promise<PullRequest> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/${prId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getPullRequestDiff(
  prId: string, 
  format: 'unified' | 'side-by-side' | 'html' = 'unified'
): Promise<PullRequestDiffResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const params = new URLSearchParams();
    if (format !== 'unified') {
      params.append('format', format);
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/${prId}/diff?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function mergePullRequest(
  prId: string, 
  mergeMessage?: string
): Promise<MergePullRequestResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/pull-requests/${prId}/merge`);
    if (mergeMessage) {
      url.searchParams.append('merge_message', mergeMessage);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function closePullRequest(prId: string): Promise<PullRequest> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/${prId}/close`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function declinePullRequest(prId: string): Promise<PullRequest> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/pull-requests/${prId}/decline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export interface PopularPlaybook {
  playbook_id: string;
  title: string;
  description: string;
  star_count: number;
  view_count: number;
  created_at: string;
}

export interface StarResponse {
  playbook_id: string;
  starred: boolean;
  star_count: number;
  message: string;
}

export async function starPlaybook(playbookId: string): Promise<StarResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/${playbookId}/star`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playbook_id: playbookId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function getPopularPlaybooks(limit: number = 5): Promise<PopularPlaybook[]> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const params = new URLSearchParams({
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/playbooks/popular?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function unstarPlaybook(playbookId: string): Promise<StarResponse> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/${playbookId}/star`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}

export async function incrementPlaybookView(playbookId: string): Promise<void> {
  try {
    const userData = sessionStorage.getItem('user_data');
    let token = null;
    
    if (userData) {
      try {
        const userDataParsed = JSON.parse(userData);
        token = userDataParsed.access_token || userDataParsed.token || userDataParsed.jwt || userDataParsed.accessToken;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    if (!token) {
      throw new Error('Authentication token not found. Please sign in again.');
    }

    const response = await fetch(`${API_BASE_URL}/playbooks/${playbookId}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playbook_id: playbookId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // View increment doesn't return data, just success/failure
    return;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
}
