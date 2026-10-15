# Slim Tesseract vendor (lazy-load)

Same-origin OCR for the web app. Loaded only when the user taps 「截图辨识」.

## Included (not the full desktop ~45MB matrix)

| File | Role |
|------|------|
| tesseract.min.js | Library entry |
| worker.min.js | Web worker |
| tesseract-core-lstm.wasm(+.js) | LSTM-only core (forced via corePath; no simd variants) |
| eng / chi_sim / chi_tra .traineddata.gz | Languages |
| SOURCES.json + *-LICENSE | Provenance |

See SOURCES.json for package versions. Do not add simd/relaxedsimd cores here.
