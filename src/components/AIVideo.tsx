import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { useCallback, useEffect, useRef } from "react";
import { InfiniteScrollRef } from "./InfiniteScroll";

type PropsType = {
  refScrollUp?: React.RefObject<InfiniteScrollRef>;
};

export const AIVideo = ({ refScrollUp }: PropsType) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const processScroll = useCallback(
    (wrist: number, thumbTip: number) => {
      wrist > thumbTip
        ? refScrollUp?.current?.scrollUp()
        : refScrollUp?.current?.scrollDown();
    },
    [refScrollUp]
  );

  useEffect(() => {
    const videoElement = videoRef.current;
    let interval: NodeJS.Timeout;
    if (!videoElement) return;

    const getUserMediaAndStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoElement.srcObject = stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    const runHandDetector = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: "tfjs",
      } satisfies handPoseDetection.MediaPipeHandsTfjsModelConfig;

      const detector = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );

      interval = setInterval(async () => {
        const hands = await detector.estimateHands(videoElement);
        console.log(hands);
        if (hands.length === 0) {
          return;
        }

        processScroll(hands[0].keypoints[0].y, hands[0].keypoints[4].y);
      }, 500);
    };

    const run = async () => {
      await getUserMediaAndStream();
      await runHandDetector();
    };

    run();

    return () => {
      clearInterval(interval);
      if (videoElement.srcObject instanceof MediaStream) {
        const stream = videoElement.srcObject;
        stream.getTracks().forEach((track) => {
          track.stop();
          stream.removeTrack(track);
        });
      }
    };
  }, [processScroll]);

  return (
    <video
      ref={videoRef}
      autoPlay
      height={500}
      width={500}
      className="absolute top-0 left-0 z-50"
      playsInline
    />
  );
};
