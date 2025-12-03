from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO
import numpy as np
import io
import os
import tensorflow as tf
import time


app = FastAPI()

loaded_models = {}
yoloModels = ["float64"]
tfliteModels = ["float16", "int8"]
BASE_DIR = os.getcwd()

def load_yolo_model(model_type):
    if model_type == "float64":
        modelPath = f"{BASE_DIR}/models/best.pt"
        if modelPath not in loaded_models:
            print(f"Loading yolo model: {modelPath}")
            loaded_models[modelPath] = YOLO(modelPath)
        return loaded_models[modelPath]
    
    else:
        return {"error": "Model not found"}

def load_tflite_model(modelType):
    if modelType == "float16":
        modelPath = f"{BASE_DIR}/models/best_float16.tflite"
        if modelPath not in loaded_models:
            print(f"Loading TFlite model: {modelPath}")
            interpreter = tf.lite.Interpreter(model_path = modelPath)
            interpreter.allocate_tensors()
            loaded_models[modelPath] = interpreter
        return loaded_models[modelPath]
    
    elif modelType == "int8":
        modelPath = f"{BASE_DIR}/models/best_int8.tflite"
        if modelPath not in loaded_models:
            print(f"Loading TFlite model: {modelPath}")
            interpreter = tf.lite.Interpreter(model_path = modelPath)
            interpreter.allocate_tensors()
            loaded_models[modelPath] = interpreter
        return loaded_models[modelPath]
    
    else:
        return {"error": "model not found"} 


print(loaded_models)

@app.post("/analyze")                                       
async def analyze(file: UploadFile = File(...), modelType: str = Form(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    print(type(img), img.shape if img is not None else "Decode failed")

    if modelType.lower() in yoloModels:
        model = load_yolo_model(modelType)

        #run inference
        results = model(img)

        for result in results:
            #Get box coords
            boxes = result.boxes  
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]

            #Draw rectangle around anomaly
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{cls_name} {conf:.2f}"
                cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    elif modelType.lower() in tfliteModels:
        interpreter = load_tflite_model(modelType) 
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        orig_h, orig_w = img.shape[:2]
        img_resized = cv2.resize(img, (640, 640))
        input_data = np.expand_dims(img_resized, 0).astype(np.float32) / 255.0

        # Run inference
        start_time = time.time()        
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])[0]  # (84, 8400)
        end_time = time.time()

        inference_time = end_time - start_time
        print(f"Inference time: {inference_time:.4f} seconds")

        # Decode
        output = output.T  # (8400, 84)
        boxes = output[:, :4]
        scores = output[:, 4:]
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)

        # Filter by confidence
        conf_thresh = 0.25
        mask = confidences > conf_thresh
        boxes = boxes[mask]
        confidences = confidences[mask]
        class_ids = class_ids[mask]

        print(f"Detections: {len(boxes)}")

        names = ['Fillings', 'Impacted Tooth', 'Implant']

        if np.max(boxes) <= 1.5:
            boxes[:, 0] *= 640
            boxes[:, 1] *= 640
            boxes[:, 2] *= 640
            boxes[:, 3] *= 640

        # Convert xywh → xyxy and rescale to original image
        boxes_xyxy = []
        for (x, y, w, h) in boxes:
            x1 = int((x - w / 2) * orig_w / 640)
            y1 = int((y - h / 2) * orig_h / 640)
            x2 = int((x + w / 2) * orig_w / 640)
            y2 = int((y + h / 2) * orig_h / 640)
            boxes_xyxy.append([x1, y1, x2, y2])

        # Clip boxes to stay inside image
        boxes_xyxy = np.clip(boxes_xyxy, 0, max(orig_w, orig_h))

        # Optional: Non-Max Suppression to remove overlapping boxes
        indices = cv2.dnn.NMSBoxes(boxes_xyxy, confidences.tolist(), conf_thresh, 0.45)

        # Draw boxes with readable labels
        for i in indices:
            i = i[0] if isinstance(i, (list, tuple, np.ndarray)) else i
            x1, y1, x2, y2 = map(int, boxes_xyxy[i])
            conf = confidences[i]
            cls_id = int(class_ids[i])

            label = f"{names[cls_id]}   {conf:.2f}"
            color = (0, 255, 0)

            # Draw rectangle
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

            # Add filled label background
            (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(img, (x1, y1 - text_h - 10), (x1 + text_w + 2, y1), color, -1)

            # Draw text over the filled rectangle
            cv2.putText(img, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
    else:
        return {"error": "Invalid modelType."}
    

    _, encoded_img = cv2.imencode(".png", img)
    bytes_io = io.BytesIO(encoded_img.tobytes())

    return StreamingResponse(bytes_io, media_type="image/png")

