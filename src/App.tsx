import { useCallback } from 'react'
import { InfiniteScroll } from './components/InfiniteScroll'
import { PostItem } from './components/PostItem'
import { useGetPosts } from './hooks/useGetPosts'

function App() {
	const { data, fetchNextPage, hasNextPage, isFetching } = useGetPosts(10)

	const onRefetch = useCallback(() => {
		fetchNextPage()
	}, [fetchNextPage])

	return (
		<InfiniteScroll
			isLastPage={!hasNextPage}
			isFetching={isFetching}
			fetchNextPage={onRefetch}>
			<div className='flex flex-col gap-3 container p-3 '>
				{data?.pages
					.flatMap(p => p.posts)
					.map(post => (
						<PostItem key={post.id} post={post} />
					))}
			</div>
			{isFetching && (
				<p className='w-full p-2 bg-white -mt-6'>Loading...</p>
			)}
		</InfiniteScroll>
	)
}

export default App
