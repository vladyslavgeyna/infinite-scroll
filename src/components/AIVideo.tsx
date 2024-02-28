import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";
import { InfiniteScrollRef } from "./InfiniteScroll";

type PropsType = {
  refScrollUp?: React.RefObject<InfiniteScrollRef>;
};

function terminateCameraStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => {
    track.stop();
    stream.removeTrack(track);
  });
}

export const AIVideo = ({ refScrollUp }: PropsType) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [detector, setDetector] = useState<handPoseDetection.HandDetector>();
  const [modelType, setModelType] = useState<"lite" | "full">("full");

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isTerminated = false;

    const getUserMediaAndStream = async () => {
      try {
        console.log("requesting camera");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        console.log("done requesting camera");

        if (isTerminated) {
          console.log("Ooops I'm terminated!");
          terminateCameraStream(stream);
          return;
        }

        videoElement.srcObject = stream;
        videoElement.oncanplay = () => setStream(stream);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    getUserMediaAndStream();

    return () => {
      isTerminated = true;
    };
  }, []);

  useEffect(() => {
    if (!stream) return;
    return () => terminateCameraStream(stream);
  }, [stream]);

  useEffect(() => {
    let isTerminated = false;

    // setDetector(undefined);

    const runHandDetector = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: "tfjs",
        modelType,
      } satisfies handPoseDetection.MediaPipeHandsTfjsModelConfig;

      const detector = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );

      if (isTerminated) {
        detector.dispose();
        return;
      }

      setDetector(detector);
    };

    runHandDetector();

    return () => {
      isTerminated = true;
    };
  }, [modelType]);

  useEffect(() => {
    if (!detector) return;
    return () => detector.dispose();
  }, [detector]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!detector || !stream || !videoElement) return;

    const interval = setInterval(async () => {
      console.log("running");
      const hands = await detector.estimateHands(videoElement);
      if (hands.length === 0 || hands[0]?.score < 0.99) {
        return;
      }
      const wristCoord = hands[0].keypoints[0].y;
      const thumbTipCoord = hands[0].keypoints[4].y;

      wristCoord > thumbTipCoord
        ? refScrollUp?.current?.scrollUp()
        : refScrollUp?.current?.scrollDown();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [detector, refScrollUp, stream]);

  // useEffect(() => {
  //   const videoElement = videoRef.current;
  //   const state: { interval?: NodeJS.Timeout } = {};
  //   if (!videoElement) return;

  //   const getUserMediaAndStream = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       console.log("stream", stream);
  //       videoElement.srcObject = stream;
  //     } catch (error) {
  //       console.error("Error accessing camera:", error);
  //     }
  //   };

  //   const runHandDetector = async () => {
  //     const model = handPoseDetection.SupportedModels.MediaPipeHands;
  //     const detectorConfig = {
  //       runtime: "tfjs",
  //     } satisfies handPoseDetection.MediaPipeHandsTfjsModelConfig;

  //     const detector = await handPoseDetection.createDetector(
  //       model,
  //       detectorConfig
  //     );

  //     state.interval = setInterval(async () => {
  //       console.log("running");
  //       const hands = await detector.estimateHands(videoElement);
  //       if (hands.length === 0 || hands[0]?.score < 0.99) {
  //         return;
  //       }
  //       const wristCoord = hands[0].keypoints[0].y;
  //       const thumbTipCoord = hands[0].keypoints[4].y;

  //       wristCoord > thumbTipCoord
  //         ? refScrollUp?.current?.scrollUp()
  //         : refScrollUp?.current?.scrollDown();
  //     }, 100);
  //   };

  //   const run = async () => {
  //     await getUserMediaAndStream();
  //     await runHandDetector();
  //   };

  //   run();

  //   return () => {
  //     clearInterval(state.interval);
  //     if (videoElement.srcObject instanceof MediaStream) {
  //       const stream = videoElement.srcObject;
  //       stream.getTracks().forEach((track) => {
  //         track.stop();
  //         stream.removeTrack(track);
  //       });
  //     }
  //   };
  // }, [refScrollUp]);

  return (
    <video
      onClick={() =>
        setModelType((prev) => (prev === "lite" ? "full" : "lite"))
      }
      ref={videoRef}
      autoPlay
      height={500}
      width={500}
      className="absolute top-0 left-0 z-50 hidden"
      playsInline
    />
  );
};
