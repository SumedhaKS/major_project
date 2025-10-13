from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO
import numpy as np
from pathlib import Path
import io
import os

app = FastAPI()

MODEL_NAME = os.getenv("MODEL_NAME", "best.pt")
modelPath = f"/app/models/{MODEL_NAME}"

print(f"Loading the model: {modelPath}")
#load the model once
model = YOLO(modelPath)


@app.post("/analyze")                                       
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()
    
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    print(type(img), img.shape if img is not None else "Decode failed")

    #run inference
    results = model(img)

    #save img for displaying results
    # img = cv2.imread(img)


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


    #Display img
    # cv2.imshow("Detections", img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
    _, encoded_img = cv2.imencode(".png", img)
    bytes_io = io.BytesIO(encoded_img.tobytes())

    return StreamingResponse(bytes_io, media_type="image/png")

