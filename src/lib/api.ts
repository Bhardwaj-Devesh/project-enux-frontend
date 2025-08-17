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
        const user = JSON.parse(userData);
        token = user.access_token || user.token || user.jwt || user.accessToken;
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
        const user = JSON.parse(userData);
        console.log('User data structure:', user); // Debug log to see the structure
        // Try different possible token field names
        token = user.access_token || user.token || user.jwt || user.accessToken;
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
