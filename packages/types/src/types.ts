export interface Product {
	id: string;
	name: string;
	description: string;
	category: string;
	url: string;
	imageUrl: string;
}

export interface SearchQuery {
	text: string;
}

export interface ResultsQuery {
	jobId: string | undefined;
}

export interface ServerFailureResponse {
	statusCode: number;
	errorMessage: string;
}
