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

# -------------------------------------------------------
# GLOBALS
# -------------------------------------------------------
loaded_models = {}

yoloModels = ["float64"]
tfliteModels = ["float16", "int8"]

BASE_DIR = os.getcwd()

# -------------------------------------------------------
# CLASS METADATA
# -------------------------------------------------------
CLASS_NAMES = ['Fillings', 'Impacted Tooth', 'Implant']

CLASS_COLORS = {
    0: (255, 0, 0),     # Blue
    1: (0, 255, 255),   # Yellow
    2: (0, 255, 0)      # Green
}

# -------------------------------------------------------
# MODEL LOADERS
# -------------------------------------------------------
def load_yolo_model(model_type):
    if model_type == "float64":
        modelPath = f"{BASE_DIR}/models/best.pt"
        if modelPath not in loaded_models:
            print(f"Loading YOLO model: {modelPath}")
            loaded_models[modelPath] = YOLO(modelPath)
        return loaded_models[modelPath]
    else:
        return None


def load_tflite_model(modelType):
    if modelType == "float16":
        modelPath = f"{BASE_DIR}/models/best_float16.tflite"
    elif modelType == "int8":
        modelPath = f"{BASE_DIR}/models/best_int8.tflite"
    else:
        return None

    if modelPath not in loaded_models:
        print(f"Loading TFLite model: {modelPath}")
        interpreter = tf.lite.Interpreter(model_path=modelPath)
        interpreter.allocate_tensors()
        loaded_models[modelPath] = interpreter

    return loaded_models[modelPath]

# -------------------------------------------------------
# DRAW UTILITIES
# -------------------------------------------------------
def draw_detection(img, x1, y1, x2, y2, cls_id, conf):
    color = CLASS_COLORS.get(cls_id, (255, 255, 255))
    label = f"{CLASS_NAMES[cls_id]} {conf:.2f}"

    # Bounding box
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

    # Label background
    (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
    cv2.rectangle(img, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)

    # Label text
    cv2.putText(
        img,
        label,
        (x1 + 2, y1 - 4),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 0, 0),
        2
    )


def draw_legend(img):
    x, y = 10, 25
    for cls_id, name in enumerate(CLASS_NAMES):
        color = CLASS_COLORS[cls_id]

        cv2.rectangle(img, (x, y - 12), (x + 18, y + 6), color, -1)
        cv2.putText(
            img,
            name,
            (x + 25, y + 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )
        y += 25

# -------------------------------------------------------
# API ENDPOINT
# -------------------------------------------------------
@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    modelType: str = Form(...)
):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Image decoding failed"}

    modelType = modelType.lower()

    # ---------------- YOLO ----------------
    if modelType in yoloModels:
        model = load_yolo_model(modelType)
        if model is None:
            return {"error": "YOLO model not found"}

        results = model(img)

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])

                draw_detection(img, x1, y1, x2, y2, cls_id, conf)

    # ---------------- TFLITE ----------------
    elif modelType in tfliteModels:
        interpreter = load_tflite_model(modelType)
        if interpreter is None:
            return {"error": "TFLite model not found"}

        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        orig_h, orig_w = img.shape[:2]
        img_resized = cv2.resize(img, (640, 640))
        input_data = np.expand_dims(img_resized, 0).astype(np.float32) / 255.0

        start_time = time.time()
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])[0]
        print(f"Inference time: {time.time() - start_time:.4f}s")

        output = output.T
        boxes = output[:, :4]
        scores = output[:, 4:]

        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)

        conf_thresh = 0.25
        mask = confidences > conf_thresh

        boxes = boxes[mask]
        confidences = confidences[mask]
        class_ids = class_ids[mask]

        if len(boxes) > 0 and np.max(boxes) <= 1.5:
            boxes *= 640

        boxes_xyxy = []
        for (x, y, w, h) in boxes:
            x1 = int((x - w / 2) * orig_w / 640)
            y1 = int((y - h / 2) * orig_h / 640)
            x2 = int((x + w / 2) * orig_w / 640)
            y2 = int((y + h / 2) * orig_h / 640)
            boxes_xyxy.append([x1, y1, x2, y2])

        boxes_xyxy = np.array(boxes_xyxy)
        indices = cv2.dnn.NMSBoxes(
            boxes_xyxy.tolist(),
            confidences.tolist(),
            conf_thresh,
            0.45
        )

        for i in indices:
            i = int(i[0]) if isinstance(i, (list, tuple, np.ndarray)) else int(i)
            x1, y1, x2, y2 = boxes_xyxy[i]
            draw_detection(img, x1, y1, x2, y2, int(class_ids[i]), confidences[i])

    else:
        return {"error": "Invalid modelType"}

    # Draw legend
    draw_legend(img)

    _, encoded_img = cv2.imencode(".png", img)
    return StreamingResponse(
        io.BytesIO(encoded_img.tobytes()),
        media_type="image/png"
    )
