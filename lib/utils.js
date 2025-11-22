import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fetcher = (...args) => fetch(...args).then(res => res.json());
export const multiFetcher = (urls) => Promise.all(urls.map(url => fetch(url).then(res => res.json())));
