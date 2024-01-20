"use client";

import React, { useRef, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";

const ObjectDetectionCamera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const runObjectDetection = async () => cocoSsd.load().then(detectObjects);
    runObjectDetection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectObjects = async (net: cocoSsd.ObjectDetection) => {
    // Webcam not ready yet
    if (
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4
    ) {
      return;
    }

    // Get Video Properties
    const video = webcamRef.current.video;
    updateCanvasDimensions(video);

    const ctx = canvasRef.current?.getContext("2d");

    // Draw bounding boxes on the canvas
    if (ctx) {
      ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);
      const predictions = await net.detect(video);
      predictions.forEach((prediction) => drawBoundingBoxes(ctx, prediction));
    }

    // Call detectObjects recursively
    requestAnimationFrame(() => detectObjects(net));
  };

  const updateCanvasDimensions = (video: HTMLVideoElement) => {
    if (canvasRef.current) {
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
    }
  };

  const drawBoundingBoxes = (
    ctx: CanvasRenderingContext2D,
    prediction: cocoSsd.DetectedObject
  ) => {
    ctx.beginPath();
    ctx.rect(
      prediction.bbox[0],
      prediction.bbox[1],
      prediction.bbox[2],
      prediction.bbox[3]
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.stroke();
    ctx.fillText(
      `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
      prediction.bbox[0],
      prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Webcam ref={webcamRef} mirrored={false} className="" />
      <canvas ref={canvasRef} className="absolute" />
    </div>
  );
};

export default ObjectDetectionCamera;
