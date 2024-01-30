/* eslint-disable @next/next/no-img-element */
"use client";

import * as tf from "@tensorflow/tfjs";
import { ChangeEvent, useEffect, useState } from "react";

const MODEL_PATH = "/models/singleposeLightning";

const HomePrice: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [model, setModel] = useState<tf.GraphModel>();

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadGraphModel(MODEL_PATH, {
        fromTFHub: true,
      });
      setModel(loadedModel);
      console.log("MODEL LOADED");
    };

    loadModel();
  }, []);

  const predict = async () => {
    if (!image || !model) return;

    const imageTensor = tf.browser.fromPixels(image);
    const resizedTensor = tf.image
      .resizeBilinear(imageTensor, [192, 192])
      .toInt();

    const tensorOutput = model.predict(tf.expandDims(resizedTensor));
    const predictions = await tensorOutput.array();

    // Draw detected points on the canvas
    drawPointsOnCanvas(predictions[0][0], image);

    // Dispose of tensors
    tf.dispose([imageTensor, resizedTensor, tensorOutput]);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !model) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    const imageURL = URL.createObjectURL(file);

    const img = new Image();
    img.src = imageURL;
    img.onload = () => {
      setImage(img);
      setCanvas(document.createElement("canvas"));
    };
  };

  const drawPointsOnCanvas = (points: number[][], img: HTMLImageElement) => {
    if (!canvas) return;
    console.log("DRAWING POINTS ON CANVAS...");

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, img.width, img.height);

    // Draw points on the canvas
    ctx.fillStyle = "red";
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point[1] * img.width, point[0] * img.height, 10, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div>
      <h1 className="text-2xl text-center p-4">Pose Detection</h1>
      <div className="flex justify-between">
        {image && (
          <button
            onClick={predict}
            className="font-bold border-2 border-white p-4 "
          >
            Detect Pose
          </button>
        )}
        <input type="file" onChange={handleImageUpload} className="float-end" />
      </div>

      {image && (
        <img
          src={image.src}
          alt="Uploaded"
          className="absolute top-72 w-full"
        />
      )}

      {canvas && (
        <canvas
          ref={(ref) => {
            setCanvas(ref);
            if (ref && image) {
              ref.width = image.width;
              ref.height = image.height;
            }
          }}
          className="absolute top-72 w-full border-2 border-red-500 z-50"
        />
      )}
    </div>
  );
};

export default HomePrice;
