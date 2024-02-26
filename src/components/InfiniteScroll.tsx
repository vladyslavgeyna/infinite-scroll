import React, { useEffect, useRef } from 'react'

type PropsType = {
	children: React.ReactNode
	isFetching: boolean
	fetchNextPage: () => void
	isLastPage?: boolean
}

export const InfiniteScroll = ({
	children,
	isFetching,
	fetchNextPage,
	isLastPage,
}: PropsType) => {
	const triggerRef = useRef<HTMLDivElement>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!triggerRef.current || !wrapperRef.current || isFetching) return

		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) {
					fetchNextPage()
				}
			},
			{ root: wrapperRef.current },
		)

		observer.observe(triggerRef.current)

		return () => {
			observer.disconnect()
		}
	}, [fetchNextPage, isFetching])

	return (
		<div
			className='overflow-auto h-[90vh] m-auto max-w-3xl'
			ref={wrapperRef}>
			{children}
			{!isLastPage && <div ref={triggerRef}></div>}
		</div>
	)
}
