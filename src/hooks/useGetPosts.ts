import { useInfiniteQuery } from '@tanstack/react-query'
import { API_URL } from '../config'
import { Post } from '../types/post'

export const useGetPosts = (limit: number) => {
	return useInfiniteQuery({
		queryKey: ['posts', limit],
		queryFn: async ({ pageParam }) => {
			const response = await fetch(
				`${API_URL}/posts?_page=${pageParam}&_limit=${limit}`,
			)
			const data = (await response.json()) as Post[]
			return {
				posts: data,
				totalCount: Number(response.headers.get('x-total-count')),
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			return allPages.length * limit < lastPage.totalCount
				? allPages.length + 1
				: undefined
		},
	})
}
