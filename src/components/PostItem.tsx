import { Post } from '../types/post'

type PropsType = {
	post: Post
}

export const PostItem = ({ post }: PropsType) => {
	return (
		<div className='border rounded-lg border-slate-500 p-2'>
			<div className='flex items-center gap-5 text-lg justify-between font-bold'>
				<p>#{post.id}</p>
				<h2>{post.title}</h2>
			</div>
			<div className='mt-3'>{post.body}</div>
		</div>
	)
}
