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
  type: string;
  message: string;
  playbook_id: string;
  playbook_title: string;
  user_id: string;
  user_email: string;
  user_full_name: string;
  created_at: string;
  is_read: boolean;
}

export interface NotificationCount {
  count: number;
}

export interface EnhancedPlaybook extends Playbook {
  fork_count: number;
  is_fork: boolean;
  forked_at: string | null;
  original_playbook_id: string | null;
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

export async function getNotifications(): Promise<Notification[]> {
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

    const response = await fetch(`${API_BASE_URL}/playbooks/notifications`, {
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
