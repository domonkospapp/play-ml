"use client";

import * as tf from "@tensorflow/tfjs";
import { ChangeEvent, useEffect, useState } from "react";

const MODEL_PATH =
  "https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/sqftToPropertyPrice/model.json";

const HomePrice: React.FC = () => {
  const [model, setModel] = useState<tf.LayersModel>();
  const [sqft, setSqft] = useState<number>(0);
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await tf.loadLayersModel(MODEL_PATH);
      loadedModel.summary();
      setModel(loadedModel);
    };

    loadModel();
  }, []);

  const predict = () => {
    setPrice(undefined);

    if (!sqft || sqft <= 0) {
      alert("Please enter a valid sqft");
      return;
    }

    const input = tf.tensor([sqft]);
    const prediction = model?.predict(input) as tf.Tensor;

    console.log(prediction);
    prediction.print();

    const value = prediction.dataSync()[0];
    setPrice(Math.round(value));

    input.dispose();
    prediction.dispose();
  };

  return (
    <div>
      <h1>Home price</h1>
      <input
        className="text-black"
        type="number"
        value={sqft}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSqft(Number(e.target.value))
        }
      />
      <button onClick={predict}>Predict</button>

      {price && <h2>Price: ${price}</h2>}
    </div>
  );
};
export default HomePrice;
