import Image from "next/image";

import { Product } from "@plum/types";

import dogImage from "../fixtures/dog.jpg";

interface Props {
	product: Product;
}

export default function ProductCard({ product }: Props) {
	const imageUrl = product.imageUrl || dogImage;

	return (
		<div className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
			<div className="relative h-48 w-full">
				<Image src={imageUrl} alt={product.name} fill className="object-cover" />
			</div>

			<div className="flex flex-col gap-3 p-5 flex-1">
				<div className="flex items-start justify-between gap-2">
					<span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
						{product.category}
					</span>
				</div>

				<div className="flex-1">
					<h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
					<p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>
				</div>

				<a
					href={product.url}
					target="_blank"
					rel="noopener noreferrer"
					className="mt-2 block w-full rounded-full bg-black py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-80"
				>
					Buy Now
				</a>
			</div>
		</div>
	);
}
