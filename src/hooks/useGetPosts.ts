import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { API_URL } from '../config'
import { Post } from '../types/post'

export const useGetPosts = (limit: number) => {
	const [posts, setPosts] = useState<Post[]>([])
	const [totalCount, setTotalCount] = useState<number | null>(null)

	const { data, isLoading, isSuccess, isError, isFetching, fetchNextPage } =
		useInfiniteQuery({
			queryKey: ['posts'],
			queryFn: async ({ pageParam = 1 }) => {
				const response = await fetch(
					`${API_URL}/posts?_page=${pageParam}&_limit=${limit}`,
				)
				if (response.headers.has('x-total-count')) {
					setTotalCount(Number(response.headers.get('x-total-count')))
				}
				const data = (await response.json()) as Post[]
				return data
			},
			initialPageParam: 1,
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length ? allPages.length + 1 : undefined
			},
		})

	useEffect(() => {
		if (isSuccess && data) {
			const newPosts = data.pages.flatMap(page => page)
			setPosts(newPosts)
		}
	}, [data, isSuccess])

	return {
		data: { posts, totalCount },
		isLoading: isLoading || isFetching,
		isSuccess,
		isError,
		fetchNextPage,
	}
}
