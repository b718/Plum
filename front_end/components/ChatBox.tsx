"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSearch } from "./context/SearchContext";

const HOUSE_LOGO =
	"M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z";
const SEND_LOGO =
	"M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z";

export default function ChatBox() {
	const router = useRouter();
	const [searchText, setSearchText] = useState("");
	const { handleSearch } = useSearch();

	function onSubmit() {
		handleSearch(searchText);
		setSearchText("");
	}

	return (
		<div className="flex w-full max-w-2xl items-center gap-3">
			<button
				onClick={() => router.push("/")}
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-black"
				aria-label="Home"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="h-5 w-5"
				>
					<path fillRule="evenodd" clipRule="evenodd" d={HOUSE_LOGO} />
				</svg>
			</button>

			<div className="flex flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-black/10">
				<input
					type="text"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					placeholder="What are you looking for?"
					className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
				/>
				<button
					onClick={onSubmit}
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 disabled:opacity-30"
					disabled={!searchText.trim()}
					aria-label="Send"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="h-4 w-4"
					>
						<path d={SEND_LOGO} />
					</svg>
				</button>
			</div>
		</div>
	);
}
