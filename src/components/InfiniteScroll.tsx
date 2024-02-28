import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
} from "react";

export type InfiniteScrollRef = {
  scrollUp: () => void;
  scrollDown: () => void;
};

type PropsType = {
  children: React.ReactNode;
  isFetching: boolean;
  fetchNextPage: () => void;
  isLastPage?: boolean;
};

export const InfiniteScroll = forwardRef<InfiniteScrollRef, PropsType>(
  ({ children, isFetching, fetchNextPage, isLastPage }, ref) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!triggerRef.current || !wrapperRef.current || isFetching) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage();
          }
        },
        { root: wrapperRef.current }
      );

      observer.observe(triggerRef.current);

      return () => {
        observer.disconnect();
      };
    }, [fetchNextPage, isFetching]);

    useImperativeHandle(
      ref,
      () => ({
        scrollUp: () => {
          if (wrapperRef.current) {
            wrapperRef.current.scrollBy({
              top: -100,
              behavior: "smooth",
            });
          }
        },
        scrollDown: () => {
          if (wrapperRef.current) {
            wrapperRef.current.scrollBy({
              top: 100,
              behavior: "smooth",
            });
          }
        },
      }),
      []
    );

    return (
      <div className="overflow-auto h-[90vh] m-auto max-w-3xl" ref={wrapperRef}>
        {children}
        {!isLastPage && <div ref={triggerRef}>&nbsp;</div>}
      </div>
    );
  }
);
