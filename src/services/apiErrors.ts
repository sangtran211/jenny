export class ApiError extends Error {
  status?: number;
  // false when asking again cannot help (bad key, no quota, unknown model)
  retryable: boolean;

  constructor(message: string, status?: number, retryable = true) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryable = retryable;
  }
}

const NON_RETRYABLE_STATUS = new Set([400, 401, 403, 404]);

// Turns Google's raw error text into something the user can act on for the cases we have seen.
export const explainApiError = (status: number, message: string): { message: string; retryable: boolean } => {
  if (status === 401 && /API keys are not supported/i.test(message)) {
    return {
      message:
        'Vertex AI từ chối key: chưa có Vertex API Key hợp lệ. Dán key Vertex (dạng AQ.…, không phải key AI Studio dạng AIza…) vào Cấu hình → "Vertex API Key (Ghi đè)".',
      retryable: false,
    };
  }
  if (status === 429 && /limit:\s*0\b/.test(message)) {
    return {
      message:
        'Model này không có hạn mức trên gói miễn phí của AI Studio (limit: 0) nên thử lại cũng vô ích. Hãy chọn model khác, chuyển sang Vertex AI, hoặc bật thanh toán cho project AI Studio.',
      retryable: false,
    };
  }
  return { message, retryable: !NON_RETRYABLE_STATUS.has(status) };
};

export const buildApiError = (status: number, rawMessage: string): ApiError => {
  const { message, retryable } = explainApiError(status, rawMessage);
  return new ApiError(message, status, retryable);
};
