import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fetcher = (...args) => fetch(...args).then(res => res.json());

export function multiFetcher(...urls) {
  return Promise.all(urls.map(url => fetcher(url)));
}
