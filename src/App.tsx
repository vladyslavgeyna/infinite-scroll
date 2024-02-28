import { useCallback, useRef, useState } from "react";
import { AIVideo } from "./components/AIVideo";
import { InfiniteScroll, InfiniteScrollRef } from "./components/InfiniteScroll";
import { PostItem } from "./components/PostItem";
import { useGetPosts } from "./hooks/useGetPosts";

function App() {
  const { data, fetchNextPage, hasNextPage, isFetching } = useGetPosts(10);
  const [isVisible, setIsVisible] = useState(true);

  const infiniteScrollRef = useRef<InfiniteScrollRef>(null);

  const onRefetch = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  if (!isVisible) {
    return (
      <>
        <div>Video is not visible</div>
        <button onClick={() => setIsVisible((prev) => !prev)}>
          Toggle Video
        </button>
      </>
    );
  }

  return (
    <div>
      <AIVideo refScrollUp={infiniteScrollRef} />

      <InfiniteScroll
        ref={infiniteScrollRef}
        isLastPage={!hasNextPage}
        isFetching={isFetching}
        fetchNextPage={onRefetch}
      >
        <div className="relative">
          <div className="flex flex-col gap-3 container p-3 ">
            {data?.pages
              .flatMap((p) => p.posts)
              .map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
          </div>
          {isFetching && (
            <p className="w-full p-2 absolute -bottom-4 left-0 z-10 bg-white">
              Loading...
            </p>
          )}
        </div>
      </InfiniteScroll>
      <button onClick={() => setIsVisible((prev) => !prev)}>
        Toggle Video
      </button>
    </div>
  );
}

export default App;
