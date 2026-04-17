export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  tag: string;
  url: string;
}

export interface SearchQuery {
  text: string;
}

export interface ServerFailureResponse {
  statusCode: number;
  errorMessage: string;
}
