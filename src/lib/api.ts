/**
 * API Integration Module
 * Integração com Cloudflare Workers API
 */

const API_BASE_URL = 'https://pergunte-ao-capitao.perfilsouiuri.workers.dev';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QuestionResponse {
  question: string;
  response: string;
  phoneme_analysis: {
    phonemes: Array<{
      phoneme: string;
      mouth_shape: string;
      duration_ms: number;
    }>;
    total_phonemes: number;
    unique_mouth_shapes: string[];
    estimated_duration_seconds: number;
  };
  tokens_used: number;
  word_count: number;
  timestamp: string;
  from_cache?: boolean;
  cache_hits?: number;
  cached_at?: string;
}

export interface UploadProgress {
  stage: 'uploading' | 'transcribing' | 'generating' | 'complete';
  progress: number;
  message: string;
}

/**
 * Upload de arquivo de pergunta
 */
export async function uploadQuestion(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ApiResponse<QuestionResponse>> {
  try {
    // Simular progresso de upload
    onProgress?.({
      stage: 'uploading',
      progress: 10,
      message: 'Enviando arquivo...'
    });

    const formData = new FormData();
    formData.append('file', file);

    // Upload do arquivo
    const uploadResponse = await fetch(`${API_BASE_URL}/upload-question`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    onProgress?.({
      stage: 'transcribing',
      progress: 40,
      message: 'Transcrevendo áudio...'
    });

    const uploadResult = await uploadResponse.json();

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress?.({
      stage: 'generating',
      progress: 70,
      message: 'Gerando resposta do Capitão...'
    });

    // Simular delay de geração
    await new Promise(resolve => setTimeout(resolve, 1500));

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Resposta pronta!'
    });

    return {
      success: true,
      data: uploadResult
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro no upload'
    };
  }
}

/**
 * Teste de resposta rápida (para demonstração)
 */
export async function testResponse(question: string): Promise<ApiResponse<QuestionResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Test response error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na API'
    };
  }
}

/**
 * Verificar status da API
 */
export async function checkApiHealth(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Health check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'API indisponível'
    };
  }
}

/**
 * Buscar estatísticas do cache
 */
export async function getCacheStats(): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/cache-stats`);
    
    if (!response.ok) {
      throw new Error(`Cache stats failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas'
    };
  }
}

/**
 * Buscar perguntas similares
 */
export async function findSimilarQuestions(question: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/similar-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Similar questions failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Similar questions error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar perguntas similares'
    };
  }
}

